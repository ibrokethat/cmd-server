'use strict';

const {map, reduce} = require('@ibrokethat/iter');

module.exports = function* dbs (conf) {

    let dbs = yield map(conf, (c) => require(`./${c.type}`)(c));

    return reduce(dbs, (acc, db) => {

        acc.conn[db.type] = db.conn;
        Object.assign(acc.db, db.db);
        return acc;

    }, {db: {}, conn: {}});
}
