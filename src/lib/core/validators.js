'use strict';

const {map} = require('@ibrokethat/iter');
const validator = require('is-my-json-valid');

const schemas = require('./schemas');

const validators = map(schemas, (schema) => validator(schema, {greedy: true, schemas: schemas}));

module.exports = validators;
