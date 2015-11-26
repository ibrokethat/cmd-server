'use strict';

const curry = require('@ibrokethat/curry');
const freeze = require('deep-freeze');
const e = require('./errors');
const validatorErrors = require('./validatorErrors');

module.exports = curry(function* handler (cmdName, inputValidator, outputValidator, fn, ctx, params) {

    let data;

    let logMsg = {
        event: 'cmd-server:cmd',
        data: {
            cmd: cmdName,
            success: true,
            time: {
                start: Date.now()
            }
        }
    };

    try {

        if (!inputValidator || inputValidator(params)) {

            if (params) {

                freeze(params);
            }

            data = yield fn(ctx, params);

            if (outputValidator  && !outputValidator(data)) {

                throw new e.InvalidOutputError(validatorErrors(outputValidator));
            }
        }
        else {

            throw new e.InvalidInputError(validatorErrors(inputValidator));
        }
    }
    catch (e) {


        logMsg.data.success = false;
        logMsg.data.stack = e.stack;
        logMsg.data.time.end = Date.now();

        process.emit('cmd-server:log', logMsg);

        throw e;
    }

    logMsg.data.time.end = Date.now();

    process.emit('cmd-server:log', logMsg);

    if (data) {

        freeze(data);
    }

    return data;

});
