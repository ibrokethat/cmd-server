'use strict';

const amqp = require('@ibrokethat/supermyx');

module.exports = function publishAmqp(CONF) {

    return {

        queue(channel, message) {

            const broker = amqp.workqueue(CONF.host).producer;

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

            const broker = amqp.pubsub(CONF.host).producer;

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
