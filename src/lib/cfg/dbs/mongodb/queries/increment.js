'use strict';

const {e} = require('@ibrokethat/cmd-server');
const curry = require('@ibrokethat/curry');

module.exports = curry(function* increment (db, collection, _id, ...args) {

    let [param, amount] = args;

    try {

        yield db.collection(collection).updateOne({_id}, {$inc: {[param]: amount}});
    }
    catch (err) {

        throw new e.UnprocessableEntityError(err);
    }

});
