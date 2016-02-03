'use strict';

const curry = require('@ibrokethat/curry');

module.exports = curry(function* count (db, collection, params, ...args) {

    args.unshift(params);

    let c = yield db.collection(collection).count(...args);

    return c;
});
