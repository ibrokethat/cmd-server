'use strict';


const {map, reduce} = require('@ibrokethat/iter');

module.exports = function* index (conf) {

    let dbs = yield map(conf, (c) => require(`./${c.type}/queries`)(c));

    return reduce(dbs, (acc, db) => {

        Object.assign(acc, db);
        return acc;

    }, {});
};
