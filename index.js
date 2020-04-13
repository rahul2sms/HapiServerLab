'use strict';

const Hapi = require('@hapi/hapi');
const Bell = require('bell');
const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');
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

    server.route({
        method: 'GET',
        path: '/login',
        options: {
            auth: 'cwpIdkProvider'
        },
        handler: (request, h) => {
            let data = null;
            if(request.session.userProfile)
            {
                return h.redirect("/print");
            }
            else if(request.auth.isAuthenticated)
            {
                request.session.credentials = request.auth.credentials;
                request.session.artifacts = request.auth.artifacts;
                request.session.userProfile = request.auth.credentials.profile;

                console.log('User authenticated successfully - ' + pwd);
                return h.redirect("/print");
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
            if(request.session.userProfile)
            {
                return JSON.stringify(request.session.userProfile);
            }
            
            return h.redirect("/login");
        }
    });

    server.route({
        method: 'GET',
        path: '/redis',
        handler: (request, h) => {
            var client = Redis.createClient({
                port: 6379,
                host: '127.0.0.1'
            });

            client.set("MyKey", "Created By Rahul jaiswal");

            return "Values saved in Redis with key MyKey";
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
    console.log("Server is running on %s", server.info.uri);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
