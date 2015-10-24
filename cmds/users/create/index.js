'use strict';

const path = require('path');
const curry = require('@ibrokethat/curry');
const promisify = require('es6-promisify');
const bcrypt = require('bcrypt');
const validator = require('is-my-json-valid');
const uuid = require('node-uuid');

const loadSchema = require(`${global.ROOT}/lib/core/loadSchema`);
const helpers = require(`${global.ROOT}/lib/helpers`);
const schemas = require(`${global.ROOT}/schemas`);
const e = require(`${global.ROOT}/lib/core/errors`);

const inputSchema = loadSchema(path.join(__dirname, './inputSchema.yaml'));

const hash = promisify(bcrypt.hash);

const validate = validator(schemas.user, {greedy: true});


exports.inputSchema = inputSchema;
exports.outputSchema = schemas.user;

exports.handler = curry(function* create (cfg, ctx, params) {

    let {db, cmds} = cfg;

    let time = helpers.currentTime();

    let username = params.username.toLowerCase();

    let userDetails = {
        _id: uuid.v4(),
        username: username,
        display_name: params.display_name || username,
        country_code: params.country_code,
        password: yield hash(params.password, 5),
        phone_number: helpers.extractNumbers(params.phone_number),
        created_at: time,
        updated_at: time,
        following: 0,
        followers: 0,
        profile: {
            first_name: params.first_name,
            last_name: params.last_name,
            profile_image: params.profile_image,
            biography: params.biography || '',
            date_of_birth: params.date_of_birth || time,
            email: params.email,
        }
    };

    if (!validate(userDetails)) {

        throw new e.InvalidDataError(validate.errors);
    }

    let r = yield db.users.create(userDetails);

    return userDetails;
});
