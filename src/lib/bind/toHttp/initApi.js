'use strict';

const CONF = require('config');

const co = require('co');
const clone = require('@ibrokethat/clone');
const curry = require('@ibrokethat/curry');
const uuid = require('node-uuid');

const {forEach, map, reduce} = require('@ibrokethat/iter');

const seal = require('@ibrokethat/deep-seal');
const value = require('useful-value');

const e = require('../../core/errors');
const transform = require('../../core/transform');
const schemas = require('../../core/schemas');

module.exports = curry(function initApi(app, handlers, cfg, apiConf) {

    let {methods, path} = apiConf;
    let {global_interceptors} = CONF.apis;

    forEach(methods, function (c, method) {

        let logMsg = {
            event: 'cmd-server:initApi',
            data: {
                api: path,
                method: method,
                success: true
            }
        };

        try {

            let ints = [...(global_interceptors || []), ...(c.interceptors || [])];
            let interceptors = map(ints, (pathTo) => require(`${global.ROOT}${CONF.paths.interceptors}/${pathTo}`));

            let transformer = c.transformer || null;

            let handlerPath = c.resource.replace('/', '.');
            let handler = value(handlers, handlerPath);

            method = method.toLowerCase();

            // generic handler
            app[method](path, function (req, res) {


                // create a ctx object
                let ctx = Object.create({}, {
                    cmdCount: {
                        value: 0,
                        writable: true
                    },
                    uuid: {
                        value: uuid.v4()
                    }
                });

                let logMsg = {
                    event: 'cmd-server:api',
                    stat: true,
                    data: {
                        api: path,
                        uuid: ctx.uuid,
                        method: method,
                        time: {
                            start: Date.now()
                        }
                    }
                };

                //  always map the user agent
                Object.defineProperty(ctx, 'userAgent', {
                    value: req.headers['user-agent'],
                    enumerable: true
                });

                //  map data from headers and http conf
                if (c.ctx) {

                    if (c.ctx.params) {

                        forEach(c.ctx.params, function (v, k) {

                            Object.defineProperty(ctx, k, {
                                value: v,
                                enumerable: true
                            });
                        });
                    }

                    if (c.ctx.headers) {

                        forEach(c.ctx.headers, function (v, k) {

                            Object.defineProperty(ctx, k, {
                                value: req.headers[v.toLowerCase()],
                                enumerable: true
                            });
                        });
                    }
                }

                if (ctx.proxy) {

                    ctx.req = req;
                }

                // grab the request data to construct the data object
                let params = req.params;
                let query = req.query;
                let body = req.body;

                let schema = value(schemas, `${ handlerPath }.params`) || {};

                let data = reduce(schema.properties || {}, function (acc, v, k) {

                    switch (true) {

                        case params.hasOwnProperty(k):

                            logMsg.data.params = params;
                            acc[k] = params[k];
                            break;

                        case query.hasOwnProperty(k):

                            logMsg.data.query = query;
                            acc[k] = query[k];
                            break;

                        case body.hasOwnProperty(k):

                            logMsg.data.body = body;
                            acc[k] = body[k];
                            break;
                    }

                    if (v.type === 'number') {

                        acc[k] = parseFloat(acc[k]);
                    }

                    return acc;
                }, {});

                // create a version of the cfg with no access to the data base
                let cfgNoDb = Object.create(cfg, {
                    db: {
                        get() {
                            throw new ReferenceError('Access to data base not allowed at this point in time');
                        }
                    }
                });

                co(function* () {

                    //   run our interceptor stack
                    for (let interceptor of interceptors) {

                        yield interceptor(cfgNoDb, ctx, data);
                    }

                    //   reset the cmdCount after the interceptors
                    ctx.cmdCount = 0;

                    //  stop anyone doing anything stupid later
                    //  we are sealing here not freezing so the cmdCount can be
                    //  incremented later

                    if (ctx.proxy) {

                        let handlerResponse = yield handler(ctx, data);
                        handlerResponse.pipe(res);

                        return true;
                    } else {

                        seal(ctx);

                        //    now we update the response by calling the bound handler
                        let handlerResponse = yield handler(ctx, data);
                        let apiResponse = clone(handlerResponse);
                        apiResponse._links = {};

                        //  transform the response
                        if (transformer) {

                            apiResponse = yield transform(transformer, cfgNoDb, ctx, apiResponse);
                        }

                        return apiResponse;
                    }
                }).then(function (apiResponse) {

                    let status = c.resCode || (method === 'post' ? 201 : 200);

                    if (!ctx.proxy) {

                        res.status(status).send(apiResponse);
                    }

                    logMsg.data.status = status;
                    logMsg.data.time.end = Date.now();

                    process.emit('cmd-server:log', logMsg);
                }).catch(function (err) {

                    if (ctx.proxy && !(err instanceof e.BlockedError)) {

                        return err;
                    }

                    let error = err;

                    switch (true) {

                        case err instanceof e.InvalidParamsError:

                            if (ctx.cmdCount === 0) {

                                error = new e.BadRequestError(err.errors);
                            } else {

                                error = new e.InternalServerError(err.errors);
                            }
                            break;

                        case err instanceof e.InvalidDataError:

                            error = new e.InternalServerError(err);
                            break;

                        case err instanceof e.InvalidReturnsError:

                            error = new e.InternalServerError(err);
                            break;

                        case err instanceof e.InvalidTransformError:

                            error = err;
                            break;

                        case !(err instanceof e.ExtendableError):

                            error = new e.InternalServerError(err);
                            break;
                    }

                    let apiResponse = error.messages;

                    if (!(error instanceof e.BadRequestError) && CONF.log.DEBUG) {

                        apiResponse.stack = error.stackTraces;
                    }

                    res.status(error.status).send(apiResponse);

                    logMsg.level = 'error';
                    logMsg.data.status = error.status;
                    logMsg.data.error = error.internalMessages;
                    logMsg.data.stack = error.stackTraces;
                    logMsg.data.time.end = Date.now();

                    process.emit('cmd-server:log', logMsg);
                });
            });
        } catch (e) {

            logMsg.level = 'error';
            logMsg.data.success = false;
            logMsg.data.error = e;
        } finally {

            process.emit('cmd-server:log', logMsg);
        }
    });
});
