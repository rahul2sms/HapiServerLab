'use strict';

const Hapi = require('@hapi/hapi');
const Bell = require('bell');
const Cache = require('./providers/CwpCache');
const { v4: uuidv4 } = require('uuid');
const enrollments = require('./endpoints/enrollments').enrollments;
Bell.providers['cwpIdkProvider'] = require('./providers/cwpIdkProvider');

const pwd = uuidv4();

const init = async() => {
    const server = Hapi.Server({host: "0.0.0.0", port: 8080});

    await server.register(Bell);

    await server.register({
        plugin: require('hapi-server-session'),
        options: {
            cookie: {
                isSecure: false
            },
            expiresIn: 90000,
            name: 'cwpid'
        }
    });

    server.auth.strategy('cwpIdkProvider', 'bell', {
        provider: 'cwpIdkProvider',
        password: pwd,
        isSecure: false,
        clientId  : 'da5f3f66-225e-48f7-a789-72cdb18f8f98@apps_vw-dilab_com',
        clientSecret : '6a8b62ffe9a90875605b346706a6460ff5bf488d8ccbf612f24903ad1a8b8117'
      });

    Cache.connect();

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            if(request.session.cwpSessionId)
            {
                return h.redirect("/garage");
            }

            return h.redirect("/login");
        }
    });

    server.route({
        method: 'GET',
        path: '/login',
        options: {
            auth: 'cwpIdkProvider'
        },
        handler: (request, h) => {
            let data = null;
            if(request.session.cwpSessionId)
            {
                return h.redirect("/garage");
            }
            else if(request.auth.isAuthenticated)
            {
                request.session.cwpSessionId = uuidv4();

                if(request.auth.credentials)
                {
                    Cache.store(request.session.cwpSessionId, 'credentials', JSON.stringify(request.auth.credentials));
                }
                
                if(request.auth.artifacts)
                {
                    Cache.store(request.session.cwpSessionId, 'artifacts', JSON.stringify(request.auth.artifacts));
                }
                
                if(request.auth.credentials.profile)
                {
                    Cache.store(request.session.cwpSessionId, 'profile', JSON.stringify(request.auth.credentials.profile));
                }
                
                console.log(`User authenticated successfully - cwpSessionId: ${request.session.cwpSessionId}`);
                return h.redirect("/garage");
            }

            let next = request.auth.credentials.query && request.auth.credentials.query.next;
            
            if(next){
                return h.redirect(next);
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/profile',
        handler: (request, h) => {
            if(request.session.cwpSessionId)
            {
                return Cache.read(request.session.cwpSessionId, 'profile');
            }

            return h.redirect("/login");
        }
    });

    server.route({
        method: 'GET',
        path: '/garage',
        handler: async (request, h) => {
            
            if(request.session.cwpSessionId)
            {
                let profile = JSON.parse(await Cache.read(request.session.cwpSessionId, 'profile'));
                let artifacts = JSON.parse(await Cache.read(request.session.cwpSessionId, 'artifacts'));

                let sub = profile.sub;
                let idToken = artifacts.id_token;
                let accessToken = artifacts.access_token;

                let garageJson = enrollments.getStatus(sub, idToken, accessToken);

                return garageJson;
            }

            return h.redirect("/login");
        }
    });

    server.route({
        method: 'GET',
        path: '/logout',
        handler: (request, h) => {
            delete request.session;

            return "session killed on logout..";
        }
    });


    await server.start();
    console.log(`Server is running on ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
