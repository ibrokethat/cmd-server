'use strict';

const path = require('path');

const clone = require('@ibrokethat/clone');

module.exports = function* find (cfg, ctx, params) {

    if (params.id === 'throw') {

        throw new Error();
    }

    let data = clone(params);
    data.find = true;

    data.ctx = clone(ctx);

    return data;
};
