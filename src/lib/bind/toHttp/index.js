'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {forEach} = require('@ibrokethat/iter');


const initApi = require('./initApi');

module.exports = function* toHttp (CONF, cfg, cmds) {

      //  create the http server
      let app = express();

      app.use(bodyParser.json()); // for parsing application/json
      app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

      forEach(CONF.paths, initApi(app, cmds, cfg));

      let port = process.env.CMD_SERVER_HTTP_PORT || CONF.port;

      let http = app.listen(port);

      console.log(`http server started on port ${port}`);

      return http;
}

