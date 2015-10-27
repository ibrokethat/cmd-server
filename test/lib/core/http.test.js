'use strict';

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/index';

const underTest = require(`${process.cwd()}${modulePath}`);
const e = require(`${process.cwd()}/src/lib/core/errors`);


let fakes;
let app;

describe(modulePath, () => {

    beforeEach((done) => {

        co(function* () {

            fakes = sinon.sandbox.create();
            app = yield underTest.init();
            console.log(app)

        }).then(done, done);

    });

    afterEach(() => {

        fakes = null;
    });

    describe('exceptions', () => {

        it.only('should throw an error if the inputSchema invalidates the params', (done) => {

            co(function* () {

            }).then(done, done);
        });

    });


    describe('success', () => {


    });

});
