'use strict';

const curry = require('@ibrokethat/curry');
const value = require('useful-value');
const e = require('./errors');
const validatorErrors = require('./validatorErrors');

module.exports = function initResource (handler, validators, cfg, category, resource, action) {

    let type = `${category}.${action}`;

    let logMsg = {
        event: 'cmd-server:initResource',
        data: {
            resource: type,
            success: true
        }
    };

    try {

        if (typeof resource.cmd !== 'function' && typeof resource.handler !== 'function') {

            throw new TypeError(`${category}/${action} has no associated cmd or handler`);
        }

        let paramsValidator = value(validators, `${type}.params`) || null;

        let returnsValidator = value(validators, `${type}.returns`) || null;
        let dbValidator = value(validators, `${type}.db`) || null;
        let c = cfg;

        //  make a unique cfg for ths resource as it has a scoped validator
        if (dbValidator) {

            c = Object.create(cfg, {
                dbValidator: {
                    value: (data) => {

                        if (!dbValidator(data)) {

                            throw new e.InvalidDataError(validatorErrors(dbValidator));
                        }
                    }
                }
            });
        }

        return handler(type, paramsValidator, returnsValidator, curry(resource.cmd || resource.handler)(c));
    }
    catch (err) {

        logMsg.level = 'error';
        logMsg.data.success = false;
        logMsg.data.error = err;

        throw err;
    }
    finally {

        process.emit('cmd-server:log', logMsg);
    }
};
