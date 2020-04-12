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

    server.auth.strategy('cwpIdkProvider', 'bell', {
        provider: 'cwpIdkProvider',
        password: pwd,
        isSecure: false,
        clientId  : 'da5f3f66-225e-48f7-a789-72cdb18f8f98@apps_vw-dilab_com',
        clientSecret : '6a8b62ffe9a90875605b346706a6460ff5bf488d8ccbf612f24903ad1a8b8117'
      });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: 'cwpIdkProvider'
        },
        handler: (request, h) => {
            let next = request.auth.credentials.query && request.auth.credentials.query.next;
            if(next){
                return h.redirect(next);
            }

            let data = null;
            if(request.auth.isAuthenticated)
            {
                let credentials = request.auth.credentials;
                let artifacts = request.auth.artifacts;
                let userProfile = request.auth.credentials.profile;

                data = JSON.stringify({
                    credentials: credentials,
                    artifacts: artifacts,
                    userProfile: userProfile
                });

                console.log('isAuthorized!! - ' +  data);
            }

            console.log('No post-authorization route set, go to default. Pwd: ' + pwd);
            return h.response("Hello World! <br/>Data: " + data);
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

    await server.start();
    console.log("Server is running on %s", server.info.uri);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
