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

            let r = yield redis.get(k);

            if (r instanceof Error) {

                process.emit('cmd-server:log', {
                    event: 'cmd-server:redisGet',
                    level: 'error',
                    data: {
                        key: k
                    }

                });
            }

            return JSON.parse(r);
        },

        * set (k, v) {

            const r = yield redis.set(k, JSON.stringify(v));

            if (r instanceof Error) {

                process.emit('cmd-server:log', {
                    event: 'cmd-server:redisSet',
                    level: 'error',
                    data: {
                        key: k,
                        value: v
                    }

                });
            }

            return r;
        }

    };
};
