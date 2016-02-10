'use strict';

const amqp = require('supermyx');

module.exports = function publishAmqp(CONF) {

    return {

        queue(channel, message) {

            process.emit('cmd-server:log', {
                event: 'cmd-server:publisher:queue',
                data: {
                    channel: channel, 
                    message: message
                }
            });

            CONF.producer.exchange = CONF.wqexchange;
            const broker = amqp.producer(CONF);
            return broker.publish(channel, message);
        },

        publish(channel, message) {

            process.emit('cmd-server:log', {
                event: 'cmd-server:publisher:publish',
                data: {
                    channel: channel,
                    message: message
                }
            });

            CONF.producer.exchange = CONF.psexchange;
            const broker = amqp.producer(CONF);
            return broker.publish(channel, message);
        }
    };
};