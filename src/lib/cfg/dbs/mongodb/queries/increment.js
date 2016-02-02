'use strict';

const curry = require('@ibrokethat/curry');
const {e} = require('../../../../core/errors');

module.exports = curry(function* increment (db, collection, _id, ...args) {

    let [param, amount] = args;

    try {

        let query = {$inc: {}};
        query.$inc = {[param]: amount};
        yield db.collection(collection).updateOne({ _id }, query);
    }
    catch (err) {

        throw new e.UnprocessableEntityError(err);
    }

});
