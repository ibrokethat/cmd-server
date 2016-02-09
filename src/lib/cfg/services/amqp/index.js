'use strict';

const amqp = require('supermyx');

module.exports = function publishAmqp (CONF) {

    // process.emit('cmd-server:log', {
    //     event: 'cmd-server:publishAmqp',
    //     data: {
    //         exchanges: [CONF.wqexchange, CONF.psexchange],
    //         url: CONF.options.url
    //     }
    // });

    return {

        queue (channel, message) {
            CONF.producer.exchange = CONF.wqexchange;
            const broker = amqp.producer(CONF);
            return broker.publish(channel, message);
        },

        publish (channel, message) {
            CONF.producer.exchange = CONF.psexchange;
            const broker = amqp.producer(CONF);
            return broker.publish(channel, message);
        }
    };
};
