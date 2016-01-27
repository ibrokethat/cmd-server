'use strict';

const amqp = require('supermyx');

module.exports = function* publishAmqp (CONF) {

    return {

        queue (channel, message) {
            CONF.consumer.exchange = CONF.wqexchange;
            const broker = amqp.producer(CONF);
            return broker.publish(channel, message);
        },

        publish (channel, message) {
            CONF.consumer.exchange = CONF.psexchange;
            const broker = amqp.producer(CONF);
            return broker.publish(channel, message);
        }
    };
};
