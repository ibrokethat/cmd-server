'use strict';

const Redis = require('ioredis');

module.exports = function redisConnect (CONF) {

    const redis = new Redis(CONF.port, CONF.host);

    redis.on('connect', () => {
        process.emit('cmd-server:log', {
            event: 'cmd-server:redisConnect',
            data: {
                host: CONF.host,
                port: CONF.port,
                success: true
            }
        });
    });

    redis.on('error', (err) => {
        process.emit('cmd-server:log', {
            event: 'cmd-server:redisError',
            data: {
                error: err
            }
        });
    });


    return {

        *get (k) {

            return yield redis.get(k);
        },

        *set (k, v) {

            yield redis.set(k, v);
        }

    };
};
