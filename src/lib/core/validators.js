'use strict';

const {map} = require('@ibrokethat/iter');
const validator = require('is-my-json-valid');

const schemas = require('./schemas');

function initValidator (schemas) {

    return map(schemas, (schema) => {

        if (schema.$schema) {

            return validator(schema, {greedy: true, schemas: schemas});
        }
        else {
            return initValidator(schema);
        }

    });
}

const validators = initValidator(schemas);

module.exports = validators;
