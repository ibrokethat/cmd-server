'use strict';

const fs = require('fs');
// const freeze = require('deep-freeze');

const CONF = require('config');

const e = require('./lib/core/errors');
const initResources = require('./lib/core/initResources');

exports.e = e;

exports.init = function* () {

    try {

        const app = {};

        //  we need to create a config object that is passed around at runtime
        let cfg = {
            cmds: {},
            db: null,
            handlers: {},
            service: null
        };

        //  initialise all the cmds
        initResources(cfg);

        //  connect to databases
        if (CONF.dbs) {

            //  run app specific db initialisation scripts first
            if (fs.existsSync(`${global.ROOT}/dbscripts`)) {

                yield require(`${global.ROOT}/dbscripts`)(CONF.dbs);
            }

            //  try app specific db query first
            if (fs.existsSync(`${global.ROOT}/lib/dbs`)) {

                cfg.db = yield require(`${global.ROOT}/lib/dbs`)(CONF.dbs);
            }
            else {

                cfg.db = yield require('./lib/cfg/dbs')(CONF.dbs);
            }
        }

        //  connect to services
        if (CONF.services) {

            //  try app specific services first
            if (fs.existsSync(`${global.ROOT}/lib/services`)) {

                cfg.services = yield require(`${global.ROOT}/lib/services`)(CONF.services);
            }
            else {

                cfg.services = yield require('./lib/cfg/services')(CONF.services);
            }

        }

        //  bind the cmds to a http server
        if (CONF.apis) {

            //  try app specific http config first
            if (fs.existsSync(`${global.ROOT}/lib/bind/toHttp`)) {

                app.http = yield require(`${global.ROOT}/lib/bind/toHttp`)(CONF.apis, cfg);
            }
            else {

                app.http = yield require('./lib/bind/toHttp')(CONF.apis, cfg);
            }

        }

        //  bind the cmds to a socket server
        if (CONF.socket) {

            app.socket = yield require(`${global.ROOT}/lib/bind/toSocket`)(CONF.socket, cfg);
        }

        //  bind the cmds to a message broker
        if (CONF.message) {

            //  try app specific message config first
            if (fs.existsSync(`${global.ROOT}/lib/bind/toHttp`)) {

                app.message = yield require(`${global.ROOT}/lib/bind/toMessage`)(CONF.message, cfg);
            }
            else {

                app.message = yield require('./lib/bind/toMessage')(CONF.message, cfg);
            }
        }

        //  stop anyone doing anything stupid later
        // freeze(cfg);

        return app;
    }
    catch (err) {

        console.log(err);

        process.emit('cmd-server:log', {
            event: 'cmd-server:start',
            data: {
                success: false,
                error: err.stack
            }
        });

    }
};

