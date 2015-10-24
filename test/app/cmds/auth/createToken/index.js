'use strict';

const path = require('path');
const curry = require('@ibrokethat/curry');
const validator = require('is-my-json-valid');
const uuid = require('node-uuid');

const loadSchema = require('../../../../lib/core/loadSchema')
const schemas = require('../../../../lib/core/loadSchemas')();
const e = require('../../../../lib/core/errors');

const helpers = require(`${process.cwd()}/lib/helpers`);

const inputSchema = loadSchema(path.join(__dirname, './inputSchema.yaml'));


exports.inputSchema = inputSchema;
exports.outputSchema = schemas.token;

exports.handler = curry(function* createToken (cfg, ctx, params) {

    let {db} = cfg;

    let authData = {
        _id: uuid.v4(),
        created_at: helpers.currentTime(),
        userId: params.userId || null,
        superuserId: superuserId || null,
        token: helpers.authToken()
    };

    if (!validate(authData)) {

        throw new e.InvalidDataError(validate.errors);
    }

    let r = yield db.authentications.create(authData);

    return {token: authData.token};
});
