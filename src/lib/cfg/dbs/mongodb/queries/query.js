'use strict';

const curry = require('@ibrokethat/curry');
const requireDir = require('require-dir');
const helpers = requireDir('../helpers');

module.exports = curry(function* query (db, collection, params, ...args) {

    args.unshift(params);

    let items = yield db.collection(collection).find(...args).toArray();

    for (let item of items) {

        helpers.date.get(item);
    }

    return items;

});
