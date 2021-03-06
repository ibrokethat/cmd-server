'use strict';

global.ROOT = global.ROOT || process.cwd();

const CONF = require('config');
const co = require('co');

const chai = require("chai");
const expect = chai.expect;
const sinonChai = require("sinon-chai");
const sinon = require('sinon');

chai.use(sinonChai);

const modulePath = '/src/lib/cfg/dbs/mongodb/helpers/date';

const underTest = require(`${process.cwd()}${modulePath}`);


let fakes;
let dataStringDates;
let dataDateDates;
let date = new Date();
let dateStr = date.getTime();

describe(modulePath, () => {

    beforeEach(() => {

        fakes = sinon.sandbox.create();
        dataStringDates = {
            created_at: dateStr,
            updated_at: dateStr,
            date_of_birth: dateStr,
            timestamp: dateStr,
            last_reported_at: dateStr,
            last_online: dateStr,
            profile: {
                date_of_birth: dateStr
            },
            state: {
                timestamp: dateStr
            }
        }

        dataDateDates = {
            created_at: date,
            updated_at: date,
            date_of_birth: date,
            timestamp: date,
            last_reported_at: date,
            last_online: date,
            profile: {
                date_of_birth: date
            },
            state: {
                timestamp: date
            }
        }

    });

    afterEach(() => {

        fakes = null;
        dataStringDates = undefined;
        dataDateDates = undefined;
    });

    it('should convert date strings to dates', () => {

        underTest.set(dataStringDates);

        expect(dataStringDates).to.deep.equal(dataDateDates);
    });

    it('should convert dates to date stings', () => {

        underTest.get(dataDateDates);

        expect(dataDateDates).to.deep.equal(dataStringDates);
    });

});
