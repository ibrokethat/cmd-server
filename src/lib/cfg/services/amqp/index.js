'use strict';

const amqp = require('supermyx');
const clone = require('@ibrokethat/clone');

module.exports = function publishAmqp(CONF) {

    return {

        queue(channel, message) {

            const amqpOptions = {exchange: CONF.queue};
            const broker = amqp.queue(CONF.host, amqpOptions).producer;

            process.emit('cmd-server:log', {
                event: 'cmd-server:publisher:queue',
                data: {
                    channel: channel,
                    message: message
                }
            });

            return broker.publish(channel, message);
        },

        publish(channel, message) {

            const amqpOptions = {exchange: CONF.pubsub};
            const broker = amqp.pubsub(CONF.host, amqpOptions).producer;

            process.emit('cmd-server:log', {
                event: 'cmd-server:publisher:publish',
                data: {
                    channel: channel,
                    message: message
                }
            });

            return broker.publish(channel, message);
        }
    };
};
