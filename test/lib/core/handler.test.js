'use strict';

global.ROOT = global.ROOT || process.cwd();

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/lib/core/handler';

const underTest = require(`${process.cwd()}${modulePath}`);
const e = require(`${process.cwd()}/src/lib/core/errors`);


let fakes;
let inputSchema;
let outputSchema;
let fn;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        inputSchema = undefined;
        outputSchema = undefined;
        fn = function* () {};
    });

    afterEach(() => {

        fakes = null;
        inputSchema = undefined;
        outputSchema = undefined;
        fn = null;
    });

    describe('exceptions', () => {

        it('should throw an error if the inputSchema invalidates the params', (done) => {

            inputSchema = {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    }
                }
            };

            let h = underTest(inputSchema, outputSchema, fn);

            co(function* () {

                let error = false;

                try {

                    yield h({}, {id:{}});
                }
                catch(e) {

                    error = e
                }

                expect(error).to.be.an.instanceOf(e.InvalidInputError);

            }).then(done, done);
        });


        it('should throw an error if the outputSchema invalidates the response', (done) => {

            outputSchema = {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    }
                }
            };

            fn = function* () {return {id: {}}};

            let h = underTest(inputSchema, outputSchema, fn);

            co(function* () {

                let error = false;

                try {

                    yield h({}, {});
                }
                catch(e) {

                    error = e;
                }

                expect(error).to.be.an.instanceOf(e.InvalidOutputError);

            }).then(done, done);

        });

    });


    describe('immutable data', () => {

        it('should freeze the params before calling it\'s function', (done) => {

            fn = function* (ctx, d) {
                d.prop = 'fail';
            };

            let h = underTest(inputSchema, outputSchema, fn);

            co(function* () {

                let error = false;

                try {

                    yield h({}, {});
                }
                catch(e) {

                    error = e;
                }

                expect(error).to.be.an.instanceOf(TypeError);

            }).then(done, done);

        });


        it('should freeze the response of it\'s function', (done) => {

            fn = function* (ctx, d) {
                return {};
            };

            let h = underTest(inputSchema, outputSchema, fn);

            co(function* () {

                let error = false;

                try {

                    let d = yield h({}, {});
                    d.prop = 'fail';
                }
                catch(e) {

                    error = e;
                }

                expect(error).to.be.an.instanceOf(TypeError);

            }).then(done, done);

        });

    });


    describe('success', () => {


        it('should pass it\'s parameters through to it\'s function', (done) => {

            let spy = fakes.spy();

            let ctx = {prop: 5};
            let d = {prop: 10};

            fn = function* (ctx, d) {
                spy(ctx, d);
                return {}
            };

            let h = underTest(inputSchema, outputSchema, fn);

            co(function* () {

                yield h(ctx, d);

                expect(spy).to.have.been.calledWith(ctx, d);

            }).then(done, done);

        });



        it('should return the response of it\'s function', (done) => {

            fn = function* (ctx, d) {
                return {prop: d.prop * 10};
            };

            let h = underTest(inputSchema, outputSchema, fn);

            co(function* () {

                let d = yield h({}, {prop: 10});

                expect(d.prop).to.equal(100);

            }).then(done, done);

        });

    });

});
