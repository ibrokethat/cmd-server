'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {forEach} = require('@ibrokethat/iter');

const initApi = require('./initApi');
const generateSwagger = require('./generateSwagger');

module.exports = function* toHttp (CONF, cfg, cmds) {

    //  create the http server
    let app = express();

    app.use(cors());

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

    forEach(CONF.paths, initApi(app, cmds, cfg));

    let swagger = generateSwagger(CONF, cmds);

    app.get('/', (req, res, next) => {
        res.set('Content-Type', 'application/json');
        res.send(swagger);
        next();
    })

    let port = process.env.PORT || CONF.port;

    let http = app.listen(port);

    process.emit('cmd-server:log', {
        event: 'cmd-server:toHttp',
        data: {
            success: true,
            message: `http server started on port ${port}`
        }
    });

    return http;
}

