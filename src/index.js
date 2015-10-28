'use strict';

const fs = require('fs');
const path = require('path');

const requireAll = require('require-all');
const co = require('co');
const {map} = require('@ibrokethat/iter');

const CONF = require('config');

const loadSchema = require('./lib/core/loadSchema');
const loadSchemas = require('./lib/core/loadSchemas');
const e = require('./lib/core/errors');

const initCmd = require('./lib/core/initCmd');


exports.loadSchema = loadSchema;
exports.loadSchemas = loadSchemas;
exports.e = e;

exports.init = function* () {

    try {

        const app = {};

        //  we need to create a config object that is passed around at runtime
        const cfg = {
            cmds: null,
            db: null,
            services: null
        };

        const cmdCategories = requireAll(path.join(global.ROOT, CONF.paths.cmds));


        //  initialise all the cmds
        const cmds = map(cmdCategories, map(initCmd(cfg)));

        //  create a ref to all our cmds on the cmds object as we only have one app at the moment
        cfg.cmds = map(cmds, map((cmd) => cmd.handler || () => {}));

        //  connect to databases
        if (CONF.dbs) {

            cfg.db = yield require(`${global.ROOT}/lib/dbs`)(CONF.dbs);
        }

        //  connect to services
        if (CONF.services) {

            cfg.services = yield require(`${global.ROOT}/lib/cfg/services`)(CONF.services);
        }


        //  bind the cmds to a http server
        if (CONF.apis) {

            //  try app specific http config first
            if (fs.existsSync(`${global.ROOT}/lib/bind/toHttp`)) {

                app.http = yield require(`${global.ROOT}/lib/bind/toHttp`)(CONF.apis, cfg, cmds);
            }
            else {

                app.http = yield require('./lib/bind/toHttp')(CONF.apis, cfg, cmds);
            }

        }

        //  bind the cmds to a socket server
        if (CONF.socket) {

            app.socket = yield require(`${global.ROOT}/lib/bind/toSocket`)(CONF.socket, cfg, cmds);
        }

        //  bind the cmds to a message broker
        if (CONF.message) {

            app.message = yield require(`${global.ROOT}/lib/bind/toMessage`)(CONF.message, cfg, cmds);
        }

        return app;
    }
    catch (e) {

        console.log(e.message);
        console.log(e.stack);
    }
}

