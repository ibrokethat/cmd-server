'use strict';

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const requireDir = require('require-dir');

chai.use(sinonChai);

const stubs = requireDir(`${process.cwd()}/test/stubs`);

const modulePath = '/src/lib/cfg/dbs/mongodb/queries/findOne';
const underTest = require(`${process.cwd()}${modulePath}`);


let fakes;
let collectionName;
let db;
let params;
let fields;
let returns;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        collectionName = 'test';
        params = 'params';
        fields = 'fields';
        returns = {value: 'returns'};
    });


    afterEach(() => {

        fakes.restore();
        collectionName = null;
        db = null;
        params = null;
        fields = null;
        returns = null;
    });

    describe('success', () => {

        it('should return an item if found', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('findOne', returns);

                let r = yield underTest(db, collectionName, params, fields);
                expect(db.collection().findOne).to.have.been.calledWith(params, fields);
                expect(r).to.deep.equal(returns);

            }).then(done, done);
        });

        it('should return an empty response if no item found', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('findOne', null);

                let r = yield underTest(db, collectionName, params);
                expect(db.collection().findOne).to.have.been.called;
                expect(r).to.equal(null);

            }).then(done, done);
        });
    });

});
