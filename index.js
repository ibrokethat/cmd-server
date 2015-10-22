'use strict';

global.ROOT = process.cwd();
global.CONF = require('config');

const path = require('path');

const co = require('co');

const express = require('express');
const bodyParser = require('body-parser');
const requireAll = require('require-all');

const sudb = require('su-db');

const {forEach, map} = require('@ibrokethat/iter');

const initCmd = require('./lib/core/initCmd');
const bindToHttp = require('./lib/core/bindToHttp');
const e = require('./lib/core/errors');

const cmdCategories = requireAll(path.join(global.ROOT, global.CONF.paths.cmds));
const queries = requireAll(path.join(global.ROOT, global.CONF.paths.queries));

//  we need to create a config object that is passed around at runtime
const cfg = {
    db: null,
    cmds: null
};


co(function* () {

    //  connect to our data bases
    const dbConf = map(global.CONF.dbs, (c) => {

        let alias = c.alias;
        let type = c.type;

        c.queries = map(queries[type], (query) => query(alias));

        return c;
    });

    cfg.db = yield sudb(dbConf);

    //  initialise all the cmds
    const cmds = map(cmdCategories, map(initCmd(cfg)));

    //  create a ref to all our cmds on the cmds object as we only have one app at the moment
    cfg.cmds = map(cmdCategories, map((cmd) => cmd.index ? cmd.index.handler : () => {}));

    //  create the http server
    let app = express();

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded


    //  bind the cmds to our http server
    forEach(CONF.apis.paths, bindToHttp(app, cmds, cfg));


    app.listen(CONF.app.port);

    console.log(`http server started on port ${CONF.app.port}`);

}).catch((err) => {

    let error = new e.InternalServerError(err);

    console.log(error.message);
    console.log(error.stackTraces);

});
