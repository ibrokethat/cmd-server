'use strict';

const CONF = require('config');

const co = require('co');
const clone = require('@ibrokethat/clone');
const curry = require('@ibrokethat/curry');
const {forEach, map, reduce} = require('@ibrokethat/iter');
const value = require('useful-value');
const freeze = require('deep-freeze');

const e = require('../../core/errors');
const transform = require('../../core/transform');
const schemas = require('../../core/schemas');

module.exports = curry(function initApi (app, cmds, cfg, apiConf) {

    let {path, methods} = apiConf;

    forEach(methods, (c, method) => {

        let interceptors = map(c.interceptors || [], (pathTo) => require(`${global.ROOT}${CONF.paths.interceptors}/${pathTo}`))
        let transformer = c.transformer || null;

        let cmdPath = c.cmd.replace('/', '.');
        let cmd = value(cmds, cmdPath);

        app[method.toLowerCase()](path, (req, res) => {

            co(function* () {

                //    grab the request data to construct the data object
                let {params, query, body} = req;

                let schema = value(schemas, `cmds.${cmdPath}.input`) || {};

                let data = reduce(schema.properties || {}, (acc, v, k) => {

                    switch (true) {

                        case (params.hasOwnProperty(k)):

                            acc[k] = params[k];
                            break;

                        case (query.hasOwnProperty(k)):

                            acc[k] = query[k];
                            break;

                        case (body.hasOwnProperty(k)):

                            acc[k] = body[k];
                            break;
                    }
                    return acc;

                }, {});

                //  todo - map data from headers and http conf
                //    create a context object to pass in
                let ctx = {
                    authToken: req.authToken || null,
                    user: null,
                };

                //   run our interceptor stack
                for (let interceptor of interceptors) {

                    yield interceptor(cfg, ctx, data);
                }

                //    stop anyone doing anything stupid later
                freeze(ctx);

                //    now we update the response by calling the bound cmd
                let cmdResponse = yield cmd(ctx, data);
                let apiResponse = clone(cmdResponse);
                apiResponse._links = {};

                //  transform the response
                if (transformer) {

                    apiResponse = yield transform(transformer, cfg, ctx, apiResponse);
                }

                return apiResponse;

            }).then((apiResponse) => {

                res.send(apiResponse);

            }).catch((err) => {

                let error = err;

                switch (true) {

                    case (err instanceof e.InvalidInputError):

                        error = new e.BadRequestError(err);
                        break;

                    case (err instanceof e.InvalidOutputError): // drop through on purpose
                    default:
                        error = new e.InternalServerError(err);
                }

                let apiResponse = {
                    message: error.toString()
                };

                if (CONF.log.DEBUG) {
                    apiResponse.stack = error.stackTraces;
                }

                res.status(error.status).send(apiResponse);

            });

        })

    });

});
