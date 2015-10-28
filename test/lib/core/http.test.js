'use strict';

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

const sa = require('superagent-promise')(require('superagent'), Promise);

chai.use(sinonChai);

const modulePath = '/src/index';

const underTest = require(`${process.cwd()}${modulePath}`);
const e = require(`${process.cwd()}/src/lib/core/errors`);

const HOST = `http://127.0.0.1:${CONF.apis.port}`;

let fakes;
let app;

describe(modulePath, () => {

    beforeEach((done) => {

        co(function* () {

            fakes = sinon.sandbox.create();
            app = yield underTest.init();

        }).then(done, done);
    });


    afterEach(() => {

        fakes = null;
        app.http.close();
    });


    describe('exceptions', () => {

        it('should throw a 400 error if the inputSchema invalidates the params', (done) => {

            co(function* () {

                let error = false;

                try {

                    let res = yield sa.post(`${HOST}/create`).send({name: 10});
                }
                catch (e) {

                    error = e;
                }

                expect(error.status).to.equal(400);

            }).then(done, done);
        });
    });


    describe('success', () => {

        it('should execute a get request', (done) => {

            co(function* () {

                let {body} = yield sa.get(`${HOST}/find/1234567890`);

                expect(body.id).to.equal('1234567890');
                expect(body.find).to.equal(true);
                expect(new Date(body.date)).to.instanceof(Date);

            }).then(done, done);
        });


        it('should execute a post request', (done) => {

            co(function* () {

                let {body} = yield sa.post(`${HOST}/create`).send({name: 'cmd-server'});

                expect(body.name).to.equal('cmd-server');
                expect(body.create).to.equal(true);

            }).then(done, done);
        });


        it('should execute a put request', (done) => {

            co(function* () {

                let {body} = yield sa.put(`${HOST}/update/1234567890`).send({name: 'cmd-server-update'});

                expect(body.id).to.equal('1234567890');
                expect(body.name).to.equal('cmd-server-update');
                expect(body.update).to.equal(true);

            }).then(done, done);
        });


        it('should execute a patch request', (done) => {

            co(function* () {

                let {body} = yield sa.patch(`${HOST}/update/1234567890`).send({name: 'cmd-server-update'});

                expect(body.id).to.equal('1234567890');
                expect(body.name).to.equal('cmd-server-update');
                expect(body.update).to.equal(true);

            }).then(done, done);
        });

    });

    describe('params', () => {

        it('should extract all required params', (done) => {

            co(function* () {

                let {body} = yield sa.post(`${HOST}/params/one/and/two`).send({
                    third: 'three',
                    fourth: 'four'
                });

                expect(body.first).to.equal('one');
                expect(body.second).to.equal('two');
                expect(body.third).to.equal('three');
                expect(body.fourth).to.equal('four');
                expect(body.fifth).to.be.undefined;
                expect(body.sixth).to.be.undefined;

            }).then(done, done);

        });

        it('should extract all params', (done) => {

            co(function* () {

                let {body} = yield sa.post(`${HOST}/params/one/and/two?fifth=five&sixth=six`).send({
                    third: 'three',
                    fourth: 'four'
                });

                expect(body.first).to.equal('one');
                expect(body.second).to.equal('two');
                expect(body.third).to.equal('three');
                expect(body.fourth).to.equal('four');
                expect(body.fifth).to.equal('five');
                expect(body.sixth).to.equal('six');

            }).then(done, done);

        });


    })
});
