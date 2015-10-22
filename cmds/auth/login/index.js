'use strict';

const path = require('path');
const curry = require('@ibrokethat/curry');
const promisify = require('es6-promisify');
const bcrypt = require('bcrypt');

const loadSchema = require(`${global.ROOT}/lib/core/loadSchema`);
const schemas = require(`${global.ROOT}/schemas`);
const e = require(`${global.ROOT}/lib/core/errors`);

const inputSchema = loadSchema(path.join(__dirname, './inputSchema.yaml'));

const compare = promisify(bcrypt.compare);


exports.inputSchema = inputSchema;
exports.outputSchema = schemas.user;

exports.handler = curry(function* login (cfg, ctx, params) {

    let {db, cmds} = cfg;

    let user = yield cmds.users.findByloginDetails(ctx, params);

    if (!user) {

        throw new e.ResourceNotFoundError();
    }

    let isPasswordValid = yield compare(params.password, user.password);

    if (!isPasswordValid) {

        throw new e.InvalidInputError();
    }

    if (params.device_token && ctx.clientApp) {

        let provider = helpers.getProvider(ctx.clientApp);

        yield cmds.devices.activate(ctx, {
            user_id: user._id,
            device_token: params.device_token,
            provider: provider
        });
    }

    let auth = yield db.auth.create({userId: user.id});

    return userDetails;
});
