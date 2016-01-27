'use strict';

const request = require('request');

module.exports = function generateProxy () {

    return function proxy (req) {

        let r = {
            uri: `http://localhost:8080${req.url}`,
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
    };
};
