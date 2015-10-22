'use strict';

const curry = require('@ibrokethat/curry');

const schemas = require(`${global.ROOT}/schemas`);
const e = require(`${global.ROOT}/lib/core/errors`);

// exports.inputSchema = {};
exports.outputSchema = schemas.user;

exports.handler = curry(function* findByLoginDetails (cfg, ctx, params) {

    let {db} = cfg;

    let loginParam = params.username || params.phone_number;

    let user = yield db.users.findOne({
        $or: [
            {username: loginParam},
            {phone_number: loginParam}
        ]
    });

    if (!user) {

        throw new e.ResourceNotFoundError();
    }

    return user;
});
