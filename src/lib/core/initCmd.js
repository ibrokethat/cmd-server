'use strict';

const curry = require('@ibrokethat/curry');
const value = require('useful-value');

const handler = require('./handler');
const validators = require('./validators');

module.exports = curry(function initCmd (cfg, category, cmd, action) {

    if (typeof cmd !== 'function') {

        throw new TypeError(`${cmd} is not a function`);
    }

    let type = `cmds.${category}.${action}`;

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

    return handler(inputValidator, outputValidator, curry(cmd)(c));
});
