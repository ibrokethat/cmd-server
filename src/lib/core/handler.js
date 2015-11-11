'use strict';

const curry = require('@ibrokethat/curry');
const freeze = require('deep-freeze');
const e = require('./errors');

module.exports = curry(function* handler (inputValidator, outputValidator, fn, ctx, params) {

    let data;

    try {
        if (!inputValidator || inputValidator(params)) {

            freeze(params);

            data = yield fn(ctx, params)

            if (outputValidator  && !outputValidator(data)) {

                console.log(outputValidator.errors);

                throw new e.InvalidOutputError(outputValidator.errors);
            }
        }
        else {

            throw new e.InvalidInputError(inputValidator.errors);
        }
    }
    catch (e) {
        throw e;
    }

    return freeze(data);

});
