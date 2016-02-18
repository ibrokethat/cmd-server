'use strict';

const amqp = require('supermyx');
const clone = require('@ibrokethat/clone');

module.exports = function publishAmqp(CONF) {

    return {

        queue(channel, message) {
            let c = clone(CONF);

            process.emit('cmd-server:log', {
                event: 'cmd-server:publisher:queue',
                data: {
                    channel: channel,
                    message: message
                }
            });

            c.producer.exchange = c.wqexchange;
            const broker = amqp.producer(c);
            return broker.publish(channel, message);
        },

        publish(channel, message) {
            let c = clone(CONF);

            process.emit('cmd-server:log', {
                event: 'cmd-server:publisher:publish',
                data: {
                    channel: channel,
                    message: message
                }
            });

            c.producer.exchange = c.psexchange;
            const broker = amqp.producer(c);
            return broker.publish(channel, message);
        }
    };
};
