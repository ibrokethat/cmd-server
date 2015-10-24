'use strict';

const path = require('path');
const curry = require('@ibrokethat/curry');
const validator = require('is-my-json-valid');
const uuid = require('node-uuid');

const loadSchema = require(`${global.ROOT}/lib/core/loadSchema`);
const schemas = require(`${global.ROOT}/schemas`);
const helpers = require(`${global.ROOT}/lib/helpers`);
const e = require(`${global.ROOT}/lib/core/errors`);

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
