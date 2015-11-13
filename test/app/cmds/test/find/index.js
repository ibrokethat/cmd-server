'use strict';

const path = require('path');

const clone = require('@ibrokethat/clone');

module.exports = function* find (cfg, ctx, params) {

    let data = clone(params);
    data.find = true;

    return data;
};
