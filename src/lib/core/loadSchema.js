'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

module.exports = (file) => yaml.safeLoad(fs.readFileSync(file, 'utf8'));
