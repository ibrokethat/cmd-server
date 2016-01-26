'use strict';

const {e} = require('@ibrokethat/cmd-server');
const curry = require('@ibrokethat/curry');
const requireDir = require('require-dir');
const helpers = requireDir('../helpers');

module.exports = curry(function* save (db, collection, params) {

    helpers.date.set(params);

    try {

        yield db.collection(collection).updateOne({_id: params._id}, params, {upsert: true});
    }
    catch (err) {

        if (/E11000/.test(err.message)) {

            const index = /\$(.+)\sdup/.exec(err.message)[1];

            const {key} = yield db.collection('system.indexes').findOne({ns: `${db.databaseName}.${collection}`, name: index});

            throw new e.ConflictError(new ReferenceError(`Data provided for '${Object.keys(key).join(', ')}' violates uniqueness`));
        }

        throw err;
    }

});
