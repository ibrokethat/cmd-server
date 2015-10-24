'use strict';

const {filter, map, reduce} = require('@ibrokethat/iter');
const requireAll = require('require-all');

const MongoClient = require('mongodb-promisified')().MongoClient

const queries = requireAll({
    dirname: __dirname,
    filter: /(?!^index.js$)(^.*$)/,
    map: (name) => name.substr(0, name.length - 3)
});


module.exports = function* mongodb (conf) {

    //  to do - add user:password, switch env variables
    const db_name = conf.name;
    const port = conf.port;
    const server = conf.server;

    const conn = yield MongoClient.connect('mongodb://' + server + ':' + port + '/' + db_name);

    let collections = yield conn.collections();

    return {
        type: conf.type,
        conn: conn,
        db: reduce(collections, (acc, c) => {

            if (!/^system/.test(c.s.name)) {

                let name = c.s.name;

                acc[name] = map(queries, (q) => q(conn, name));
            }

            return acc;
        }, {})
    };
};
