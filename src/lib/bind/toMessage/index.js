'use strict';

const amqp = require('@ibrokethat/supermyx');
const value = require('useful-value');
const co = require('co');
const e = require('../../core/errors');

module.exports = function* toMessage(CONF, cfg) {

    for (let c of CONF.subscribers) {

        const handlerPath = c.resource.replace('/', '.');
        const handler = value(cfg.handlers, handlerPath);
        const broker = amqp.workqueue(CONF.host).consumer;

        broker.subscribe(c.channel, function (message, ack) {
            const ctx = message.ctx;
            const params = message.params;

            let logMsg = {
                stat: true,
                data: {
                    channel: c.channel,
                    handler: c.resource,
                    uuid: ctx.uuid,
                    time: {
                        start: Date.now()
                    },
                    ctx: ctx,
                    params: params
                }
            };

            co(function* () {

                logMsg.event = 'cmd-server:subscriber:message';
                process.emit('cmd-server:log', logMsg);

                yield handler(ctx, params);
            }).then(function () {

                ack();

                logMsg.event = 'cmd-server:subscriber:ack';
                logMsg.data.status = 'success';
                logMsg.data.time.end = Date.now();

                process.emit('cmd-server:log', logMsg);
            }).catch(function (err) {

                //reject and requeue
                //ack(true, true);

                //reject and discard
                ack(true, false);

                let error = err;

                switch (true) {

                    case err instanceof e.InvalidParamsError:

                        error = new e.BadRequestError(err.errors);
                        break;

                    case err instanceof e.InvalidDataError:

                        error = new e.InvalidDataError(err.errors);
                        break;

                    case err instanceof e.InvalidReturnsError:

                        error = new e.InternalServerError(err);
                        break;

                    case err instanceof e.InvalidTransformError:

                        error = new e.InvalidTransformError(err);
                        break;

                    case !(err instanceof e.ExtendableError):

                        error = new e.InternalServerError(err);
                        break;
                }

                logMsg.level = 'error';
                logMsg.event = 'cmd-server:subscriber:reject';
                logMsg.data.status = error.status;
                logMsg.data.error = error.internalMessages;
                logMsg.data.stack = error.stackTraces;
                logMsg.data.time.end = Date.now();
                logMsg.data.message = message;

                process.emit('cmd-server:log', logMsg);
            });
        });
    }
};
