'use strict'

module.exports = function* (cfg, ctx, data) {

    let d = {};

    if (typeof data.count === 'number') {
        d.count = data.count * 10;
    }

    return d;
}