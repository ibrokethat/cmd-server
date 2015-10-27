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

const cmdCategories = requireAll(path.join(process.cwd(), CONF.paths.cmds));

//  we need to create a config object that is passed around at runtime
const cfg = {
    cmds: null,
    db: null,
    services: null
};

exports.loadSchema = loadSchema;
exports.loadSchemas = loadSchemas;
exports.e = e;

exports.init = function* () {

    let app = {};

    try {

        //  initialise all the cmds
        const cmds = map(cmdCategories, map(initCmd(cfg)));

        //  create a ref to all our cmds on the cmds object as we only have one app at the moment
        cfg.cmds = map(cmds, map((cmd) => cmd.handler || () => {}));

        //  connect to databases
        if (CONF.dbs) {

            cfg.db = yield require(`${process.cwd()}/lib/dbs`)(CONF.dbs);
        }

        //  connect to services
        if (CONF.services) {

            cfg.services = yield require(`${process.cwd()}/lib/cfg/services`)(CONF.services);
        }


        //  bind the cmds to http server
        if (CONF.apis) {

            //  try app specific http config first
            if (fs.existsSync(`${process.cwd()}/lib/bind/toHttp`)) {

                app.http = yield require(`${process.cwd()}/lib/bind/toHttp`)(CONF.apis, cfg, cmds);
            }
            else {

                app.http = yield require('./lib/bind/toHttp')(CONF.apis, cfg, cmds);
            }

        }

        //  bind the cmds to socket server
        if (CONF.socket) {

            app.socket = yield require(`${process.cwd()}/lib/bind/toSocket`)(CONF.socket, cfg, cmds);
        }

        //  bind the cmds to message broker
        if (CONF.message) {

            app.message = yield require(`${process.cwd()}/lib/bind/toMessage`)(CONF.message, cfg, cmds);
        }

        return app;
    }
    catch (e) {

        console.log(e.message);
        console.log(e.stack);
    }
}

