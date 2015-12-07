'use strict';

const path = require('path');

const requireAll = require('require-all');
const {forEach} = require('@ibrokethat/iter');
const value = require('useful-value');

const CONF = require('config');

const handler = require('./handler');
const initResource = require('./initResource');
const validators = require('./validators');


module.exports = (cfg) => {

    const cmdCategories = requireAll(path.join(global.ROOT, CONF.paths.resources));

    forEach(cmdCategories, (cmds, category) => {

        forEach(cmds, (resource, action) => {

            const r = initResource(handler, validators, cfg, category, resource, action);
            let o = resource.cmd ? cfg.cmds : cfg.handlers;

            value.assign(o, `${category}.${action}`, r);
        });
    });

    return cfg;
};
