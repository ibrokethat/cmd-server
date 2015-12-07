'use strict';

const path = require('path');

const clone = require('@ibrokethat/clone');

module.exports = function* update (cfg, ctx, params) {

    let data = clone(params);
    data.update = true;

    return data;
};
