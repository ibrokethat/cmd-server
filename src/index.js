'use strict';

const path = require('path');


const requireAll = require('require-all');
const co = require('co');
const {forEach, map} = require('@ibrokethat/iter');

const CONF = require('config');

const initCmd = require('./lib/core/initCmd');
const e = require('./lib/core/errors');

const cmdCategories = requireAll(path.join(process.cwd(), CONF.paths.cmds));

//  we need to create a config object that is passed around at runtime
const cfg = {
    cmds: null,
    db: null,
    services: null
};


co(function* () {


    //  initialise all the cmds
    const cmds = map(cmdCategories, map(initCmd(cfg)));

    //  create a ref to all our cmds on the cmds object as we only have one app at the moment
    cfg.cmds = map(cmds, map((cmd) => cmd.handler || () => {}));

    //  connect to databases
    if (CONF.dbs) {

        const dbs = yield require(`${process.cwd()}/lib/dbs`)(CONF.dbs);

        cfg.db = dbs.db;

        //  todo: call db init/upgrade scripts here
    }

    //  connect to services
    if (CONF.services) {

        cfg.services = yield require(`${process.cwd()}/lib/services`)(CONF.services);
    }


    //  bind the cmds to http server
    if (CONF.apis.paths) {

        const express = require('express');
        const bodyParser = require('body-parser');
        const bindToHttp = require('./lib/core/bindToHttp');

        //  create the http server
        let app = express();

        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

        forEach(CONF.apis.paths, bindToHttp(app, cmds, cfg));

        app.listen(CONF.app.port);

        console.log(`http server started on port ${CONF.app.port}`);
    }


    //  bind the cmds to socket server
    if (CONF.socket) {
        //  todo
    }

    //  bind the cmds to message broker
    if (CONF.message) {
        //  todo
    }



}).catch((err) => {

    console.log(err.message);
    console.log(err.stack);
});
