'use strict';

const ROOT = `${process.cwd()}/build`;
const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/lib/core/initCmd';

const underTest = require(`${ROOT}${modulePath}`);
const e = require(`${ROOT}/lib/core/errors`);


let fakes;
let cmd;
let cfg;

describe(modulePath, () => {

    beforeEach(()  =>  {

        fakes = sinon.sandbox.create();
        cmd = {
            index: {
                inputSchema: undefined,
                outputSchema: undefined,
                handler: fakes.spy()
            }
        };
        cfg = {prop: 10};
    });

    afterEach(()  =>  {

        fakes = null;
        cmd = null;
        cfg = null;
    });

    describe('exceptions', () => {

        it('should throw an error if the handler is not a function', () => {

            cmd.index.handler = {};

            let error = false;

            try {

                underTest({}, cmd);
            }
            catch(e) {

                error = e
            }

            expect(error).to.be.an.instanceOf(TypeError);
        });

    });


    describe('success', () => {

        it('should bind the cfg correctly', () => {

            underTest(cfg, cmd);

            expect(cmd.index.handler).to.have.been.calledWith(cfg);
        });


        it('should return an object with the bound cmd and no schemas', () => {

            let c = underTest({}, cmd);

            expect(c.inputSchema).to.equal(null);
            expect(c.outputSchema).to.equal(null);
            expect(c.handler).to.be.a('function');

        });

        it('should return an object with the bound cmd and schemas', () => {

            cmd.index.inputSchema = {};
            cmd.index.outputSchema = {};

            let c = underTest({}, cmd);

            expect(c.inputSchema).to.equal(cmd.index.inputSchema);
            expect(c.outputSchema).to.equal(cmd.index.outputSchema);
            expect(c.handler).to.be.a('function');

        });


    });

});
