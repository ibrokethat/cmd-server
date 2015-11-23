'use strict';

const fs = require('fs');

const CONF = require('config');
const {reduce} = require('@ibrokethat/iter');
const loadSchema = require('./loadSchema');

function load (dirname) {

    let schemas = reduce(fs.readdirSync(dirname), (acc, fileName) => {

        if (/.yaml$/.test(fileName)) {

            let schemaName = fileName.substr(0, fileName.length - 5);

            acc[schemaName] = loadSchema(`${dirname}/${fileName}`);
        }

        return acc;

    }, {});

    return schemas;
}

let schemas = load(`${process.cwd()}${CONF.paths.schemas}`);

module.exports = schemas;
