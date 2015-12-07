'use strict';

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/lib/core/initResource';

const underTest = require(`${process.cwd()}${modulePath}`);
const e = require(`${process.cwd()}/src/lib/core/errors`);


let fakes;
let handler;
let validators;
let cfg;
let category;
let resource;
let action;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        handler = fakes.spy();
        validators = {
            ['test.get.params']: 'params',
            ['test.get.returns']: 'returns'
        };
        cfg = {prop: 10};
        category = 'test';
        resource = {
            cmd: fakes.spy()
        };
        action = 'get';
    });

    afterEach(() => {

        fakes = null;
        handler = null;
        validators = null;
        cfg = null;
        category = null;
        resource = null;
        action = null;
    });

    describe('exceptions', () => {

        it('should throw an error if the resource is not a function', () => {

            resource.cmd = {};

            let error = false;

            try {

                underTest(handler, validators, {}, category, resource, action);
            }
            catch(e) {

                error = e
            }

            expect(error).to.be.an.instanceOf(TypeError);
        });

    });

    describe('cmds', () => {

        describe('success', () => {

            it('should bind the cfg correctly', () => {

                underTest(handler, validators, cfg, category, resource, action);

                expect(resource.cmd).to.have.been.calledWith(cfg);
            });


            it('should bind with no validators', () => {

                validators = {};

                underTest(handler, validators, cfg, category, resource, action);

                expect(handler).not.to.have.been.calledWith(`${category}.${action}`, 'params', 'returns');

            });


            it('should bind the validators', () => {

                underTest(handler, validators, cfg, category, resource, action);

                expect(handler).to.have.been.calledWith(`${category}.${action}`, 'params', 'returns');
            });


            it('should bind the dbValidator to the cfg correctly', () => {

                validators = {
                    ['test.get.db']: fakes.stub().returns(true)
                };

                underTest(handler, validators, cfg, category, resource, action);

                let c = resource.cmd.args[0][0];

                expect(c.__proto__).to.equal(cfg);
                expect(c.dbValidator).to.be.a.function;

                c.dbValidator(100);
                expect(validators['test.get.db']).to.have.been.calledWith(100);
            });



            it('should throw the dbValidator errors', () => {

                validators = {
                    ['test.get.db']: fakes.stub().returns(false)
                };

                validators['test.get.db'].errors = [{
                    field: 'data.test',
                    message: 'is required'
                }];

                validators['test.get.db'].toJSON = () => {};

                underTest(handler, validators, cfg, category, resource, action);

                let c = resource.cmd.args[0][0];

                let error = false;

                try {

                    c.dbValidator(100);
                }
                catch (err) {

                    error = err;
                }

                expect(error.name).to.equal('InvalidDataError')

            });


        });

    });

    describe('handlers', () => {


        beforeEach(() => {

            resource = {
                handler: fakes.spy()
            };

        });


        describe('success', () => {

            it('should bind the cfg correctly', () => {

                underTest(handler, validators, cfg, category, resource, action);

                expect(resource.handler).to.have.been.calledWith(cfg);
            });


            it('should bind with no validators', () => {

                validators = {};

                underTest(handler, validators, cfg, category, resource, action);

                expect(handler).not.to.have.been.calledWith(`${category}.${action}`, 'params', 'returns');

            });


            it('should bind the validators', () => {

                underTest(handler, validators, cfg, category, resource, action);

                expect(handler).to.have.been.calledWith(`${category}.${action}`, 'params', 'returns');
            });


            it('should bind the dbValidator to the cfg correctly', () => {

                validators = {
                    ['test.get.db']: fakes.stub().returns(true)
                };

                underTest(handler, validators, cfg, category, resource, action);

                let c = resource.handler.args[0][0];

                expect(c.__proto__).to.equal(cfg);
                expect(c.dbValidator).to.be.a.function;

                c.dbValidator(100);
                expect(validators['test.get.db']).to.have.been.calledWith(100);
            });



            it('should throw the dbValidator errors', () => {

                validators = {
                    ['test.get.db']: fakes.stub().returns(false)
                };

                validators['test.get.db'].errors = [{
                    field: 'data.test',
                    message: 'is required'
                }];

                validators['test.get.db'].toJSON = () => {};

                underTest(handler, validators, cfg, category, resource, action);

                let c = resource.handler.args[0][0];

                let error = false;

                try {

                    c.dbValidator(100);
                }
                catch (err) {

                    error = err;
                }

                expect(error.name).to.equal('InvalidDataError')

            });

        });

    });

});
