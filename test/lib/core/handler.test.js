'use strict';

global.ROOT = `${process.cwd()}/build`;
global.CONF = require('config');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/lib/core/handler';

const underTest = require(`${global.ROOT}${modulePath}`);

let fakes;

describe(modulePath, () => {

  beforeEach(()  =>  {

    fakes = sinon.sandbox.create();

  });


  it('should fucking run', () => {

    expect(true).to.be.equal(true);
  });

});
