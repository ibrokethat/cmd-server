'use strict';

const path = require('path');
const fs = require('fs');

const CONF = require('config');
const {forEach} = require('@ibrokethat/iter');
const loadSchema = require('./loadSchema');

function load (dirname, schemas, p) {

    forEach(fs.readdirSync(dirname), (fileName) => {

        let item = path.resolve(dirname, fileName);

        let stat = fs.statSync(item);

        if (stat && stat.isDirectory()) {

            load(item, schemas, p ? `${p}.${fileName}`: `${fileName}`);
        }
        else if (/.yaml$/.test(fileName)) {

            let schemaName = p ? `${p}.${fileName.substr(0, fileName.length - 5)}` : fileName.substr(0, fileName.length - 5);
            schemas[schemaName] = loadSchema(`${dirname}/${fileName}`);
        }

    });

    return schemas;
}

let schemas = {};

if (CONF.paths.schemas) {

    schemas = load(`${process.cwd()}${CONF.paths.schemas}`, schemas);
}

schemas = load(`${global.ROOT || process.cwd()}${CONF.paths.resources}`, schemas);

module.exports = schemas;
