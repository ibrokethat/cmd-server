'use strict';

const co = require('co');
const curry = require('@ibrokethat/curry');
const {forEach, map, reduce} = require('@ibrokethat/iter');
const value = require('useful-value');
const deepFreeze = require('deep-freeze');

const e = require(`${global.ROOT}/lib/core/errors`);
const transform = require(`${global.ROOT}/lib/core/transform`);


module.exports = curry(function bindToHttp (app, cmds, cfg, apiConf) {

    let {path, methods} = apiConf;

    forEach(methods, (c, method) => {

        let interceptors = map(c.interceptors || [], (pathTo) => require(`${global.ROOT}/lib/interceptors/${pathTo}`))
        let transformer = c.transformer || null;

        let cmd = value(cmds, c.cmd.replace('/', '.'));

        app[method.toLowerCase()](path, (req, res) => {

            co(function* () {

                //    grab the request data to construct the data object
                let {params, query, body} = req;

                let data = reduce(cmd.inputSchema.properties, (acc, v, k) => {

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
                deepFreeze(ctx);
                deepFreeze(data);

                //    now we update the response by calling the bound cmd
                let apiResponse = yield cmd.handler(ctx, data);
                apiResponse._links = {};

                //  transform the response
                if (transform) {

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

                if (global.CONF.log.DEBUG) {
                    apiResponse.stack = error.stackTraces;
                }

                res.status(error.status).send(apiResponse);

            });

        })

    });

});
