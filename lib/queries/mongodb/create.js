'use strict';

const curry = require('@ibrokethat/curry');

module.exports = curry(function* create (collection, db, params) {

    let conn = yield db.connection(); // return a connection from the current pool

    return yield conn.collection(collection).insertOne(params);
});
