'use strict'

const clone = require('@ibrokethat/clone');

module.exports = function* (cfg, ctx, data) {

    let d = clone(data);

    if (data.hasTransformProperty) {

        delete d.hasTransformProperty;
        d.transform = true;
    }

    return d;
}
