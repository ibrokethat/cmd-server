'use strict';

const {map, reduce} = require('@ibrokethat/iter');
const requireDir = require('require-dir');

const MongoClient = require('mongodb').MongoClient;

const queries = requireDir(__dirname);

module.exports = function* mongodb (conf) {

    //  to do - add user:password, switch to env variables
    const db_name = conf.name;
    const port = conf.port;
    const server = conf.server;

    const db = yield MongoClient.connect('mongodb://' + server + ':' + port + '/' + db_name);

    let collections = yield db.collections();

    return reduce(collections, (acc, c) => {

        if (!/^system/.test(c.s.name)) {

            let name = c.s.name;

            acc[name] = map(queries, (q) => q(db, name));
        }

        return acc;
    }, {});
};
