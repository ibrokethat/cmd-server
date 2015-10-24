'use strict';

const {map, reduce} = require('@ibrokethat/iter');

module.exports = function* dbs (conf) {

    let dbs = yield map(conf, (c) => require(`./${c.type}`)(c));

    return reduce(dbs, (acc, db) => {

        acc.dbs[db.type];
        acc.queries = map(db.queries, (q) => q);
        return acc;

    }, {dbs: {}, queries: {}});
}
