'use strict';


const {map, reduce} = require('@ibrokethat/iter');


function* generateQueries (conf) {

    let dbs = yield map(conf, (c) => require(`./${c.type}/queries`)(c));

    return reduce(dbs, (acc, db) => {

        Object.assign(acc, db);
        return acc;

    }, {});
}


function* runScripts (conf) {

    yield map(conf, (c) => require(`./${c.type}/scripts`)(c));
}


module.exports = function* index (conf) {

    yield runScripts(conf);

    return yield generateQueries(conf);
};
