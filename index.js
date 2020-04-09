'use strict';

const Hapi = require('@hapi/hapi');

const init = async() => {
    const server = Hapi.Server({port: 3000, host: "localhost"});

    server.route({
        method: 'GET',
        path: '/start',
        handler: (request, h) => {
            return "Hello World!";
        }
    });
    /*
    var polyglot = new Polyglot({locale: "en"});
    polyglot.extend({
        "hello": "Hello",
        "hello_name": "Hello, %{name}",
        "foo": {"bar": "This phrase's key is foo.bar."}
    });
    console.log("Polyglot locale is - " + polyglot.locale());
    console.log(polyglot.t("hello_name", {name: "Rahul"}));
*/

    await server.start();
    console.log("Server is running on %s", server.info.uri);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});



init();