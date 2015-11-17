'use strict';

const curry = require('@ibrokethat/curry');
const freeze = require('deep-freeze');
const e = require('./errors');
const validatorErrors = require('./validatorErrors');

module.exports = curry(function* handler (inputValidator, outputValidator, fn, ctx, params) {

    let data;

    try {
        if (!inputValidator || inputValidator(params)) {

            freeze(params);

            data = yield fn(ctx, params)

            if (outputValidator  && !outputValidator(data)) {

                throw new e.InvalidOutputError(validatorErrors(outputValidator));
            }
        }
        else {

            throw new e.InvalidInputError(validatorErrors(inputValidator));
        }
    }
    catch (e) {

        throw e;
    }

    return freeze(data);

});
