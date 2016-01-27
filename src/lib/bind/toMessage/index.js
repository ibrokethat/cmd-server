'use strict';

const amqp = require('supermyx');
const value = require('useful-value');
const co = require('co');

module.exports = function* toMessage (CONF, cfg) {

    for (let c of CONF.subscribers) {

        CONF.consumer.exchange = CONF.wqexchange;

        const handlerPath = c.resource.replace('/', '.');
        const handler = value(cfg.handlers, handlerPath);
        const broker = amqp.consumer(CONF);

        broker.subscribe(c.channel, (message, ack) => {

            const {ctx, params} = message;

            return co(function* () {

                try {
                    ack();
                    return yield handler(cfg, ctx, params);

                }
                catch (ex) {
                    let logMsg = { level: 'error', event: 'Subscriber Error', data: ex };
                    process.emit('worker:log', logMsg);
                }
            });
        });
    }

};
