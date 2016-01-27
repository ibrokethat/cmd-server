'use strict';

const value = require('useful-value');

//  helps get JSONSCHEMA date formats in and out of
//  mongo correctly
//  need to keep the set updated with all date fields
//  bit awkward, but not as painfull as mongoose - chortle
//  TODO: need to do arrays of items too...

const params = new Set([
    'created_at',
    'updated_at',
    'date_of_birth',
    'profile.date_of_birth',
    'timestamp',
    'state.timestamp',
    'last_reported_at',
    'last_online'
]);


exports.get = function get (data) {

    for (let param of params) {

        let date = value(data, param);

        if (date) {

            value.assign(data, param, date.toISOString());
        }
    }
};


exports.set = function set (data) {

    for (let param of params) {

        let date = value(data, param);

        if (date) {

            value.assign(data, param, new Date(date));
        }
    }
};
