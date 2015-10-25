'use strict';

const curry = require('@ibrokethat/curry');

const handler = require('./handler');

module.exports = curry(function initCmd (cfg, cmd) {

    if (!cmd.index) {
        return {};
    }

    let {inputSchema, outputSchema, handler: fn} = cmd.index;

    if (typeof fn !== 'function') {

        throw new TypeError(`${fn} is not a function`);
    }

    return {
        inputSchema: inputSchema || null,

        handler: handler(inputSchema, outputSchema, fn(cfg)),

        outputSchema: outputSchema || null
    };

});
