'use strict';

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/lib/core/initCmd';

const underTest = require(`${process.cwd()}${modulePath}`);
const e = require(`${process.cwd()}/src/lib/core/errors`);


let fakes;
let cmd;
let cfg;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        cmd = fakes.spy();
        cfg = {prop: 10};
    });

    afterEach(() => {

        fakes = null;
        cmd = null;
        cfg = null;
    });

    describe('exceptions', () => {

        it.only('should throw an error if the handler is not a function', () => {

            cmd = {};

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
