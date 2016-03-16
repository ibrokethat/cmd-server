'use strict';

const sinon = require('sinon');

module.exports = function collection (method, returns, keyObj) {

    if (returns === null) {
        returns = Promise.resolve(null);
    }

    let fn = sinon.stub()[returns instanceof Error ? 'throws' : 'returns'](returns);
    let fnIndex = sinon.stub().returns(keyObj);

    return {
        collection (c) {

            let ret = {
                [method]: fn
            };

            if (c === 'system.indexes') {

                ret.findOne = fnIndex;
            }

            return ret;
        }
    };
};
