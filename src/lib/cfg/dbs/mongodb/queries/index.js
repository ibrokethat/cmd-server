'use strict';

const {map, reduce} = require('@ibrokethat/iter');
const requireDir = require('require-dir');

const MongoClient = require('mongodb').MongoClient;

const queries = requireDir(__dirname);

module.exports = function* mongodb (conf) {

    const uri = conf.uri;
    const options = conf.options || {};
    const db = yield MongoClient.connect(uri, options);

    let collections = yield db.collections();

    return reduce(collections, (acc, c) => {

        if (!/^system/.test(c.s.name)) {

            let name = c.s.name;

            acc[name] = map(queries, (q) => q(db, name));
        }

        return acc;
    }, {});
};
