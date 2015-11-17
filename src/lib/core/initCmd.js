'use strict';

const curry = require('@ibrokethat/curry');
const value = require('useful-value');

module.exports = curry(function initCmd (handler, validators, cfg, category, cmd, action) {

    let type = `${category}.${action}`;

    let logMsg = {
        event: 'cmd-server:initCmd',
        data: {
            cmd: type,
            success: true
        }
    };

    try {

        if (typeof cmd.index !== 'function') {

            throw new TypeError(`${category}/${action} is not a function`);
        }

        let inputValidator = value(validators, `${type}.input`) || null;

        let outputValidator = value(validators, `${type}.output`) || null;
        let dbValidator = value(validators, `${type}.db`) || null;
        let c = cfg;

        //  make a unique cfg for ths cmd as it has a scoped validator
        if (dbValidator) {

            c = Object.create(cfg, {
                dbValidator: {
                    value: dbValidator
                }
            });
        }

        return handler(type, inputValidator, outputValidator, curry(cmd.index)(c));
    }
    catch (e) {

        logMsg.data.success = false;
        logMsg.data.error = e;
    }
    finally {

        process.emit('cmd-server:log', logMsg);
    }

});
