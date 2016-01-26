'use strict';

const curry = require('@ibrokethat/curry');
const {e} = require('../../../../core/errors');

module.exports = curry(function* increment (db, collection, _id, ...args) {

    let [param, amount] = args;

    try {

        yield db.collection(collection).updateOne({_id}, {$inc: {[param]: amount}});
    }
    catch (err) {

        throw new e.UnprocessableEntityError(err);
    }

});
