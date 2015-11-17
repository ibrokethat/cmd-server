'use strict';

const {map} = require('@ibrokethat/iter');
const value = require('useful-value');



const getField = (schema, field) => {

    field = field.replace('.', '.properties.');

    return value(schema.properties, field);
}


module.exports = function validatorErrors (validator) {

    let {errors} = validator;

    let schema = validator.toJSON();

    return map(errors, (err) => {

        let field = /^data\.(.+)/.exec(err.field)[1];
        let e;
        let message;

        switch (err.message) {

            case 'is the wrong type':

                message = `${field} ${err.message}: expected to be ${getField(schema, field).type}`;
                e = new TypeError(message);
                break;

            case 'is required':

                message = `${field} ${err.message}: expected to be present`;
                e = new ReferenceError(message);
                break;

            case 'must be an enum value':

                message = `${field} ${err.message}: expected to be one of [${getField(schema, field).enum.join(', ')}]`;
                e = new TypeError(message);
                break;

            default:

                message = `${field} ${err.message}`;

                if (/format$/.test(err.message)) {

                    e = new TypeError(message);
                }
                else {

                    e = new Error(message);
                }

        }

        return e;
    });
}
