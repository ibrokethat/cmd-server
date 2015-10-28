'use strict';

const path = require('path');
const fs = require('fs');

const CONF = require('config');
const {reduce} = require('@ibrokethat/iter');
const loadSchema = require('./loadSchema');

let schemas = null;

module.exports = function loadSchemas () {

    schemas = schemas || reduce(fs.readdirSync(`${global.ROOT}${CONF.paths.schemas}`), (acc, fileName) => {

        if (/.yaml$/.test(fileName)) {

            let schemaName = fileName.substr(0, fileName.length - 5);

            acc[schemaName] = loadSchema(`${global.ROOT}${CONF.paths.schemas}/${fileName}`);
        }

        return acc;

    }, {});

    return schemas;
}
