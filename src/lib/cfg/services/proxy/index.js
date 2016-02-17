'use strict';

const request = require('request');

module.exports = function generateProxy (CONF) {

    process.emit('cmd-server:log', {
        event: 'cmd-server:generate:proxy',
        data: {
            protocol: CONF.protocol,
            host: CONF.host,
            port: CONF.port,
            success: true
        }
    });

    return function proxy (req) {

        try {

            let r = {
                uri: `${CONF.protocol}${CONF.host}:${CONF.port}${req.url}`,
                method: req.method,
                headers: {
                    authorization: req.headers.authorization,
                    access_token: req.headers.access_token,
                    'user-agent': req.headers['user-agent']
                },
                body: req.body,
                json: true
            };

            return request(r);

        }
        catch (ex) {

            process.emit('cmd-server:log', {
                event: 'cmd-server:generate:proxy',
                level: 'error',
                data: {
                    error: ex
                }
            });

            process.exit(-1);
        }
    };
};
