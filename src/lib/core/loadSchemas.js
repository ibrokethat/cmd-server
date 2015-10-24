'use strict';

const path = require('path');
const fs = require('fs');
const {reduce} = require('@ibrokethat/iter');
const loadSchema = require('./loadSchema');

let schemas = null;

module.exports = function loadSchemas () {

    schemas = schemas || reduce(fs.readdirSync(global.CONF.paths.schemas), (acc, fileName) => {

        if (/.yaml$/.test(fileName)) {

            let schemaName = fileName.split('.');

            schemaName.pop();

            acc[schemaName.join('.')] = loadSchema(`${global.CONF.paths.schemas}/${fileName}`);
        }

        return acc;

    }, {});

    return schemas;
}
