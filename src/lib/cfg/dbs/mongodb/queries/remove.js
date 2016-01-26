'use strict';

const {e} = require('@ibrokethat/cmd-server');
const curry = require('@ibrokethat/curry');
const requireDir = require('require-dir');
const helpers = requireDir('../helpers');

module.exports = curry(function* remove (db, collection, params) {

    let {value} = yield db.collection(collection).findOneAndDelete(params);

    if (!value) {

        throw new e.NotFoundError();
    }

    helpers.date.get(value);

    return value;

});
