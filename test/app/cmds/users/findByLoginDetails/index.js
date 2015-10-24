'use strict';

const curry = require('@ibrokethat/curry');

const schemas = require('../../../../lib/core/loadSchemas')();
const e = require('../../../../lib/core/errors');

exports.outputSchema = schemas.user;

exports.handler = curry(function* findByLoginDetails (cfg, ctx, params) {

    let {db} = cfg;

    let loginParam = params.username || params.phone_number;

    let query = {
        $or: [
            {username: loginParam},
            {phone_number: loginParam}
        ]
    };

    let user = yield db.users.findOne(query);

    if (!user) {

        throw new e.ResourceNotFoundError();
    }

    return user;
});
