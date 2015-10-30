'use strict';

const {forEach, map, reduce} = require('@ibrokethat/iter');

module.exports = function generateSwagger (CONF, cmds) {

    return {

      "swagger": "2.0",
      "info": {
        "version": "1.0.0",
        "title": "Swagger Petstore",
        "description": "A sample API that uses a petstore as an example to demonstrate features in the swagger-2.0 specification",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
          "name": "Swagger API Team",
          "email": "foo@example.com",
          "url": "http://madskristensen.net"
        },
        "license": {
          "name": "MIT",
          "url": "http://github.com/gruntjs/grunt/blob/master/LICENSE-MIT"
        }
      },
      "host": "petstore.swagger.io",
      "basePath": "/api",
      "schemes": [
        "http"
      ],
      "consumes": [
        "application/json"
      ],
      "produces": [
        "application/json"
      ],


    }

};
