'use strict'

const clone = require('@ibrokethat/clone');

module.exports = function* (cfg, ctx, data) {

    let d = clone(data);

    d.date = new Date().toISOString();

    return d;
}
