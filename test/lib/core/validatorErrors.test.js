'use strict';

global.ROOT = global.ROOT || process.cwd();

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/lib/core/validatorErrors';

const underTest = require(`${process.cwd()}${modulePath}`);
const validators = require(`${process.cwd()}/src/lib/core/validators`);


let fakes;
let validator;
let data;

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        validator = validators.exceptions;
        data = {
            throwString: 'string',
            throwRequired: 'string',
            throwEnum: 'valid',
            throwFormat: '2015-11-17T10:13:06.510Z',
            throwNested: {
                throwString: 'string'
            }
        };
    });

    afterEach(() => {

        fakes = null;
        validator = undefined;
    });

    describe('error types', () => {

        it('should create a type error', () => {

            data.throwString = 4;

            validator(data);

            let [e] = underTest(validator);

            expect(e).to.be.an.instanceOf(TypeError);
            expect(e.message).to.equal('throwString is the wrong type: expected to be string');

        });

        it('should create a reference error', () => {

            delete data.throwRequired;

            validator(data);

            let [e] = underTest(validator);

            expect(e).to.be.an.instanceOf(ReferenceError);
            expect(e.message).to.equal('throwRequired is required: expected to be present');

        });

        it('should create a type error for an enum value', () => {

            data.throwEnum = 'invalid';

            validator(data);

            let [e] = underTest(validator);

            expect(e).to.be.an.instanceOf(TypeError);
            expect(e.message).to.equal('throwEnum must be an enum value: expected to be one of [valid, accept]');

        });

        it('should create a type error for a format', () => {

            data.throwFormat = 'invalid';

            validator(data);

            let [e] = underTest(validator);

            expect(e).to.be.an.instanceOf(TypeError);
            expect(e.message).to.equal('throwFormat must be date-time format');

        });


        it('should create a nested type error', () => {

            data.throwNested.throwString = 4;

            validator(data);

            let [e] = underTest(validator);

            expect(e).to.be.an.instanceOf(TypeError);
            expect(e.message).to.equal('throwNested.throwString is the wrong type: expected to be string');

        });

        it('should collect all errors', () => {

            data.throwString = 4;
            delete data.throwRequired;
            data.throwEnum = 'invalid';
            data.throwFormat = 'invalid';
            data.throwNested.throwString = 4;

            validator(data);

            let e = underTest(validator);

            expect(e.length).to.be.equal(5);
        });

    });


    describe('no errors', () => {

        it('should be thrown if data is valid', () => {

            expect(validator(data)).to.be.true;

        });

    });

});
