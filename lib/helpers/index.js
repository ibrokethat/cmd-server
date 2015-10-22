'use strict';
const path = require('path');
const requireAll = require('require-all');

module.exports = requireAll(path.join(global.ROOT, '/lib/helpers'));
