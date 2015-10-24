'use strict';

const curry = require('@ibrokethat/curry');

const handler = require(global.ROOT + '/lib/core/handler');

module.exports = curry(function initCmd (cfg, cmd) {

    if (!cmd.index) {
        return {};
    }

    let {inputSchema, outputSchema, handler: fn} = cmd.index;

    return {
        inputSchema: inputSchema || {},

        handler: handler(inputSchema, outputSchema, fn(cfg)),

        outputSchema: outputSchema || {}
    };

});
