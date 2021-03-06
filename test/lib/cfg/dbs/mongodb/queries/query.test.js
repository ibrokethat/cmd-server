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

const modulePath = '/src/lib/cfg/dbs/mongodb/queries/query';
const underTest = require(`${process.cwd()}${modulePath}`);


let fakes;
let collectionName;
let db;
let params;
let fields;
let returns;
let toArray;
let sort;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        collectionName = 'test';
        params = 'params';
        fields = 'fields';
        returns = [];
        toArray = {
            toArray: () => returns
        };
        sort = {
            sort: () => toArray
        }
    });


    afterEach(() => {

        fakes.restore();
        collectionName = null;
        db = null;
        params = null;
        fields = null;
        returns = null;
        toArray = null;
        sort = null;
     });


    describe('success', () => {

        it('should call the underlying query correctly', (done) => {

            co(function* () {

                let db = stubs.mongodbCollection('find', sort);

                let r = yield underTest(db, collectionName, params, fields);
                expect(db.collection().find).to.have.been.calledWith(params, fields);
                expect(r).to.deep.equal(returns);

            }).then(done, done);
        });
    });

});
