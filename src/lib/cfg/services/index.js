'use strict';

const {reduce} = require('@ibrokethat/iter');

function generateServices (conf) {

    return reduce(conf, (acc, c) => {

        acc[c.type] = require(`./${c.type}`)(c);
        return acc;
    }, {});
}



module.exports = function* index (conf) {

    return generateServices(conf);
};
