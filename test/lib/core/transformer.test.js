'use strict';

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/lib/core/transform';

const underTest = require(`${process.cwd()}${modulePath}`);
const e = require(`${process.cwd()}/src/lib/core/errors`);

let fakes;
let transformer;
let cfg;
let ctx;
let data;

describe(modulePath, () => {

    beforeEach(()  =>  {

        fakes = sinon.sandbox.create();
        transformer = 'test.api';
        cfg = {prop: 10};
        ctx = {prop: 5};
        data = {
            id: 'id',
            hasTransformProperty: true
        }
    });

    afterEach(()  =>  {

        fakes = null;
        transformer = null;
        cfg = null;
        ctx = null;
        data = null;
    });

    describe('exceptions', () => {

        it('should throw an error if the transformer does not exist', (done) => {

            transformer = 'doesNotExist';

            let error = false;

            co(function* () {

                try {

                    yield underTest(transformer, cfg, ctx, data);
                }
                catch(e) {

                    error = e
                }

                expect(error).to.be.an.instanceOf(ReferenceError);

            }).then(done, done);
        });


        it('should throw an error if the transformed data does match the schema', (done) => {

            delete data.hasTransformProperty;

            let error = false;

            co(function* () {

                try {

                    yield underTest(transformer, cfg, ctx, data);
                }
                catch(e) {

                    error = e
                }

                expect(error).to.be.an.instanceOf(e.InvalidOutputError);

            }).then(done, done);
        });


        it('should throw an error if a transform property does not match the referenced schema', (done) => {

            data.externalItem = {
                count: "ten"
            }

            let error = false;

            co(function* () {

                try {

                    let r = yield underTest(transformer, cfg, ctx, data);
                }
                catch(e) {

                    error = e
                }

                expect(error).to.be.an.instanceOf(e.InvalidOutputError);

            }).then(done, done);
        });

        it('should throw an error if a transform property of items does not match the referenced schema', (done) => {

            data.refItems = [
                {id: 10, hasTransformProperty: true}
            ];

            let error = false;

            co(function* () {

                try {

                    yield underTest(transformer, cfg, ctx, data);
                }
                catch(e) {

                    error = e
                }

                expect(error).to.be.an.instanceOf(e.InvalidOutputError);

            }).then(done, done);
        });

    });


    describe('success', () => {

        it('should transform a schema with references correctly', (done) => {

            data.externalItem = {
                count: 10
            };

            data.refItems = [
                {id: 'id2', hasTransformProperty: true}
            ];

            let error = false;

            co(function* () {

                let r;

                try {

                    r = yield underTest(transformer, cfg, ctx, data);
                }
                catch(e) {

                    error = e;
                }

                expect(error).to.be.equal(false);
                expect(r).to.deep.equal({
                    id: 'id',
                    transform: true,
                    externalItem: {
                        count: 100
                    },
                    refItems: [
                        { id: 'id2', transform: true }
                    ]
                });

            }).then(done, done);
        });

    });

});
