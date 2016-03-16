'use strict';

const {forEach} = require('@ibrokethat/iter');
const sinon = require('sinon');

module.exports = function cmd (cmds, category, action, returns, ...args) {

    if (!cmds[category]) {
        cmds[category] = {};
    }

    if (returns instanceof Error) {

        cmds[category][action] = sinon.stub().throws(returns);
    }
    else {

        args.unshift(returns);

        let stub = sinon.stub();

        forEach(args, (v, k) => stub.onCall(k).returns(v));

        cmds[category][action] = stub;
    }
};