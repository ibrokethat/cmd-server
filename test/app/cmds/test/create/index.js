'use strict';

const path = require('path');

const clone = require('@ibrokethat/clone');

module.exports = function* create (cfg, ctx, params) {

    let data = clone(params);
    data.create = true;

    return data;
};
