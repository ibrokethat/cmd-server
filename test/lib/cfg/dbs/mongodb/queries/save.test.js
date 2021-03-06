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

const modulePath = '/src/lib/cfg/dbs/mongodb/queries/save';
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
        params = {_id: 1};
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

                let err = new Error('MongoError: E11000 duplicate key error index: yubl-ng.test.$username_1 dup key: { : \"mrmr\" }');
                let keyObj = {key: {username: 1}}

                let db = stubs.mongodbCollection('updateOne', err, keyObj);
                db.databaseName = 'yubl-ng';
                let error = false;

                try {

                    yield underTest(db, collectionName, params);
                }
                catch (e) {

                    error = e;
                }

                expect(error.name).to.equal('ConflictError');
                expect(error.errors[0].name).to.equal('ReferenceError');
                expect(error.errors[0].message).to.equal('Data provided for \'username\' violates uniqueness');
            }).then(done, done);
        });
    });


    describe('success', () => {

        it('should call the underlying query correctly', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('updateOne', returns);

                let r = yield underTest(db, collectionName, params);
                expect(db.collection().updateOne).to.have.been.calledWith({_id: params._id} , params, {upsert: true});

            }).then(done, done);
        });
    });

});
