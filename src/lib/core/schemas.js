'use strict';

const path = require('path');
const fs = require('fs');

const CONF = require('config');
const {reduce} = require('@ibrokethat/iter');
const loadSchema = require('./loadSchema');

function load (dirname) {

    let dir = fs.readdirSync(dirname);

    let schemas = reduce(dir, (acc, fileName) => {

        let path = `${dirname}/${fileName}`;

        if (fs.statSync(path).isDirectory()) {

            acc[fileName] = load(path);
        }
        else if (/.yaml$/.test(fileName)) {

            let schemaName = fileName.substr(0, fileName.length - 5);

            acc[schemaName] = loadSchema(path);
        }

        return acc;

    }, {});

    return schemas;

}

let schemas = load(`${process.cwd()}${CONF.paths.schemas}`);

module.exports = schemas;
