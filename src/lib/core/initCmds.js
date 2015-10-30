'use strict';

const path = require('path');

const requireAll = require('require-all');
const {map} = require('@ibrokethat/iter');

const CONF = require('config');

const initCmd = require('./initCmd');

module.exports = (cfg) => {

    const cmdCategories = requireAll(path.join(global.ROOT, CONF.paths.cmds));

    const cmds = map(cmdCategories, (cmds, category) => map(cmds, initCmd(cfg, category)));

    //  create a ref to all our cmds on the cfg object
    cfg.cmds = map(cmds, map((cmd) => cmd));

    return cmds;
}

