'use strict';

const path = require('path');
const curry = require('@ibrokethat/curry');

const loadSchema = require(`${global.ROOT}/lib/core/loadSchema`);
const schemas = require(`${global.ROOT}/schemas`);
const e = require(`${global.ROOT}/lib/core/errors`);

// const inputSchema = loadSchema(path.join(__dirname, './inputSchema.yaml'));


// exports.inputSchema = inputSchema;
exports.outputSchema = schemas.user;

exports.handler = curry(function* deactivate (cfg, ctx, params) {


    return true;
});
