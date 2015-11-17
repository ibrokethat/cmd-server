'use strict';

const path = require('path');
const {map} = require('@ibrokethat/iter');
const reRemoveBasePath = new RegExp( '' + global.ROOT, 'gim' );
const loadSchema = require('./loadSchema');

const CONF = loadSchema(path.join(__dirname,'../../../config/default.yaml'));

class ExtendableError extends Error {

    constructor (name, def, errors) {

        errors = errors ? (Array.isArray(errors) ? errors : [errors]) : [];

        super(def.message);

        Object.defineProperty(this, 'name', {
            enumerable : false,
            value : name
        });

        Object.defineProperty(this, 'status', {
            enumerable : false,
            value : def.status
        });

        Object.defineProperty(this, 'displayMessages', {
            enumerable : false,
            value : def.displayMessages
        });

        Object.defineProperty(this, 'errors', {
            enumerable : true,
            value : errors
        });

        if (Error.hasOwnProperty('captureStackTrace')) {

            Error.captureStackTrace(this, this.constructor);
        }
        else {

          Object.defineProperty(this, 'stack', {
              enumerable : false,
              value : (new Error(def.message)).stack,
          });
        }
    }

    toString () {

        return this.name + ': ' + this.message;
    }

    value () {

        return `[object ${this.name}]`;
    }

    get safeStack () {

        return this.stack.replace(reRemoveBasePath, '').split('\n');
    }

    get stackTraces () {

        let stack = map(this.errors, function (e) {
            return e.stack.split('\n');
        });

        stack.unshift(this.stack);

        return stack;
    }

    get messages () {

        let msgs = {
            error: this.toString()
        };

        if (this.displayMessages) {

            msgs.data = map(this.errors, (e) => {
                return e.messages ? e.messages : e.toString();
            });
        }

        return msgs;
    }
}


module.exports = map(CONF.errors, (def, name) => {

    return class extends ExtendableError {

        constructor (e) {

            super(name, def, e);
        }

    }

});

module.exports.ExtendableError = ExtendableError;
