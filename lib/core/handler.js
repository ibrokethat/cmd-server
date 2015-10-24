'use strict';

const freeze = require('deep-freeze');
const validator = require('is-my-json-valid');
const e = require('./errors');

module.exports = function handler (inputSchema, outputSchema, fn) {

    let validateInput = inputSchema ? validator(inputSchema, {greedy: true}) : null;
    let validateOutput = outputSchema ? validator(outputSchema, {greedy: true}) : null;

    return function* (ctx, params) {

        let data;

        try {
            if (!validateInput || validateInput(params)) {

                data = yield fn(ctx, params)

                if (validateOutput  && !validateOutput(data)) {

                    throw new e.InvalidOutputError(validateOutput.errors);
                }

            }
            else {

                throw new e.InvalidInputError(validateInput.errors);
            }
        }
        catch (e) {
            throw e;
        }

        return freeze(data);
    }

}
