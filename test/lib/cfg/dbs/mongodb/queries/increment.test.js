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

const modulePath = '/src/lib/cfg/dbs/mongodb/queries/increment';
const underTest = require(`${process.cwd()}${modulePath}`);


let fakes;
let collectionName;
let db;
let id;
let param;
let value;
let returns;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        collectionName = 'test';
        id = 'id';
        param = 'param';
        value = 1;
        returns = {value: 'returns'};
    });


    afterEach(() => {

        fakes.restore();
        collectionName = null;
        db = null;
        id = null;
        param = null;
        value = null;
        returns = null;
    });

    describe('exceptions', () => {

        it('should throw the correct error if the update does nothing', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('updateOne', new Error());

                let error = false;

                try {

                    yield underTest(db, collectionName, id, param, value);
                }
                catch (e) {

                    error = e;
                }

                expect(error.name).to.equal('UnprocessableEntityError');

            }).then(done, done);
        });

    });


    describe('success', () => {

        it('should call the underlying query correctly', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('updateOne', returns);

                let r = yield underTest(db, collectionName, id, param, value);
                expect(db.collection().updateOne).to.have.been.calledWith({_id: id}, {$inc: {[param]: value}});

            }).then(done, done);
        });
    });

});
