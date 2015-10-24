'use strict';

const curry = require('@ibrokethat/curry');

module.exports = curry(function* create (db, collection, params) {

    return yield db.collection(collection).insertOne(params);
});
