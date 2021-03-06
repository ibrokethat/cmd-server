'use strict';

const curry = require('@ibrokethat/curry');
const freeze = require('deep-freeze');
const e = require('./errors');
const validatorErrors = require('./validatorErrors');

module.exports = curry(function* handler(cmdName, paramsValidator, returnsValidator, fn, ctx, params) {

    let data;

    let logMsg = {
        stat: true,
        data: {
            cmd: cmdName,
            level: 'debug',
            success: true,
            uuid: ctx.uuid,
            time: {
                start: Date.now()
            },
            params: params
        }
    };

    try {

        if (!paramsValidator || paramsValidator(params)) {

            if (params) {

                freeze(params);
            }

            data = yield fn(ctx, params);

            logMsg.data.response = data;

            if (returnsValidator && !returnsValidator(data)) {

                throw new e.InvalidReturnsError(validatorErrors(returnsValidator));
            }
        } else {

            throw new e.InvalidParamsError(validatorErrors(paramsValidator));
        }
    } catch (err) {

        logMsg.event = 'cmd-server:cmd:error';
        logMsg.level = 'error';
        logMsg.data.success = false;
        logMsg.data.stack = err.stack;
        logMsg.data.time.end = Date.now();

        process.emit('cmd-server:log', logMsg);

        throw err;
    }

    logMsg.event = 'cmd-server:cmd:success';
    logMsg.data.time.end = Date.now();

    process.emit('cmd-server:log', logMsg);

    if (!ctx.proxy && data) {

        freeze(data);
    }

    if (ctx.hasOwnProperty('cmdCount') && typeof ctx.cmdCount === 'number') {

        ctx.cmdCount = ctx.cmdCount + 1;
    }

    return data;
});
