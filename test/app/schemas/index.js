'use strict';

const path = require('path');
const fs = require('fs');
const {reduce} = require('@ibrokethat/iter');
const loadSchema = require(`${global.ROOT}/lib/core/loadSchema`);

module.exports = reduce(fs.readdirSync(`${global.ROOT}/schemas`), (acc, fileName) => {

    if (/.yaml$/.test(fileName)) {

        let schemaName = fileName.split('.');

        schemaName.pop();

        acc[schemaName.join('.')] = loadSchema(`${global.ROOT}/schemas/${fileName}`);
    }

    return acc;

}, {});
