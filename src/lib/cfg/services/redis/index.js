'use strict';

const Redis = require('ioredis');

module.exports = function redisConnect (CONF) {

    const redis = new Redis(CONF.port, CONF.host);

    return {

        *get (k) {

            return yield redis.get(k);
        },

        *set (k, v) {

            yield redis.set(k, v);
        }

    };
};
