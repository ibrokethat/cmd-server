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

const modulePath = '/src/lib/cfg/dbs/mongodb/queries/remove';
const underTest = require(`${process.cwd()}${modulePath}`);


let fakes;
let collectionName;
let db;
let params;
let returns;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        collectionName = 'test';
        params = 'params';
        returns = {value: 'returns'};
    });

    afterEach(() => {

        fakes.restore();
        collectionName = null;
        db = null;
        params = null;
        returns = null;
    });

    describe('exceptions', () => {

        it('should catch the error of the underlying query and then throw the correct error', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('findOneAndDelete', {value: null});

                let error = false;

                try {

                    yield underTest(db, collectionName, params);
                }
                catch (e) {

                    error = e;
                }

                expect(error.name).to.equal('NotFoundError');

            }).then(done, done);
        });
    });


    describe('success', () => {

        it('should call the underlying query correctly', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('findOneAndDelete', returns);

                let r = yield underTest(db, collectionName, params);
                expect(db.collection().findOneAndDelete).to.have.been.calledWith(params);
                expect(r).to.equal(returns.value);

            }).then(done, done);
        });
    });

});
