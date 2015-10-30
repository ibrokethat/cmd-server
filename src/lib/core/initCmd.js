'use strict';

const curry = require('@ibrokethat/curry');

const handler = require('./handler');
const validators = require('./validators');

module.exports = curry(function initCmd (cfg, category, cmd, action) {

    if (typeof cmd !== 'function') {

        throw new TypeError(`${cmd} is not a function`);
    }

    let type = `${category}.${action}`;

    let inputValidator = validators[`${type}.input`] || null;
    let outputValidator = validators[`${type}.output`] || null;
    let dbValidator = validators[`${type}.db`] || null;
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
