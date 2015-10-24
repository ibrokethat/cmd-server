'use strict';
const path = require('path');
const requireAll = require('require-all');

module.exports = requireAll({
    dirname: __dirname,
    filter: /(?!^index.js$)(^.*$)/,
    map: (name) => name.substr(0, name.length - 3)
});
