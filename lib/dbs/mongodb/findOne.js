'use strict';

const curry = require('@ibrokethat/curry');

module.exports = curry(function* findOne (db, collection, params) {

    return yield db.collection(collection).findOne(params);
});
