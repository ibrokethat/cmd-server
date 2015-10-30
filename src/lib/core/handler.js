'use strict';

const freeze = require('deep-freeze');
const e = require('./errors');

module.exports = function handler (inputValidator, outputValidator, fn) {

    return function* (ctx, params) {

        let data;

        try {
            if (!inputValidator || inputValidator(params)) {

                freeze(params);

                data = yield fn(ctx, params)

                if (outputValidator  && !outputValidator(data)) {

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
    }

}
