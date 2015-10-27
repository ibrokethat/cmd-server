'use strict';

const path = require('path');

const clone = require('@ibrokethat/clone');
const curry = require('@ibrokethat/curry');

const loadSchema = require(process.cwd() + '/src/lib/core/loadSchema')

const inputSchema = loadSchema(path.join(__dirname, './inputSchema.yaml'));

exports.inputSchema = inputSchema;

exports.handler = curry(function* create (cfg, ctx, params) {

    let data = clone(params);
    data.create = true;

    return data;
});
