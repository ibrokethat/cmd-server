'use strict';

const value = require('useful-value');
const curry = require('@ibrokethat/curry');
const requireDir = require('require-dir');
const helpers = requireDir('../helpers');

module.exports = curry(function* query (db, collection, params, ...args) {

    let orderBy = value(args, '0.orderBy') || value(args, '1.orderBy') || {};

    args.unshift(params);

    let items = yield db.collection(collection).find(...args).sort(orderBy).toArray();

    for (let item of items) {

        helpers.date.get(item);
    }

    return items;

});
