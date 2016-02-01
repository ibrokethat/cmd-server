'use strict';

const amqp = require('supermyx');
const value = require('useful-value');
const co = require('co');
const e = require('../../core/errors');


module.exports = function* toMessage (CONF, cfg) {

    for (let c of CONF.subscribers) {

        CONF.consumer.exchange = CONF.wqexchange;

        const handlerPath = c.resource.replace('/', '.');
        const handler = value(cfg.handlers, handlerPath);
        const broker = amqp.consumer(CONF);

        broker.subscribe(c.channel, (message, ack) => {

            const {ctx, params} = message;

            let logMsg = {
                event: 'cmd-server:subscriber',
                data: {
                    channel: c.channel,
                    handler: c.resource,
                    time: {
                        start: Date.now()
                    },
                    ctx: ctx,
                    params: params
                }
            };


            co(function* () {

                yield handler(ctx, params);

            }).then(() => {

                ack();

                logMsg.data.status = 'success';
                logMsg.data.time.end = Date.now();

                process.emit('worker:log', logMsg);

            }).catch((err) => {

                let error = err;

                switch (true) {

                    case (err instanceof e.InvalidParamsError):

                        error = new e.BadRequestError(err.errors);
                        break;

                    case (err instanceof e.InvalidDataError):

                        error = new e.InvalidDataError(err.errors);
                        break;

                    case (err instanceof e.InvalidReturnsError):

                        error = new e.InternalServerError(err);
                        break;

                    case (err instanceof e.InvalidTransformError):

                        error = new e.InvalidTransformError(err);
                        break;

                    case (!(err instanceof e.ExtendableError)):

                        error = new e.InternalServerError(err);
                        break;
                }

                logMsg.level = 'error';
                logMsg.data.status = error.status;
                logMsg.data.error = error.internalMessages;
                logMsg.data.stack = error.stackTraces;
                logMsg.data.time.end = Date.now();

                process.emit('worker:log', logMsg);

            });

        });
    }

};
