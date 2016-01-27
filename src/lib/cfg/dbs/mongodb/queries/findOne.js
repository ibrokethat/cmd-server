'use strict';

const curry = require('@ibrokethat/curry');
const requireDir = require('require-dir');
const helpers = requireDir('../helpers');

module.exports = curry(function* findOne (db, collection, params, ...args) {

    args.unshift(params);

    let item = yield db.collection(collection).findOne(...args);

    if (!item) {

        return null;
    }

    helpers.date.get(item);

    return item;

});
