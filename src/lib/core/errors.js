'use strict';

const CONF = require('config');

const {map} = require('@ibrokethat/iter');
const reRemoveBasePath = new RegExp( '' + process.cwd(), 'gim' );

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

        Object.defineProperty(this, 'errors', {
            enumerable : false,
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

        return map(this.errors, function (e) {
            return e.stack.split('\n');
        });
    }

    get messages () {

        let msgs = map(this.errors, (e) => {
            return e.messages ? e.messages : {
                message: e.toString()
            }
        });

        return {
          message: this.toString(),
          messages: msgs
        };
    }
}


module.exports = map(CONF.errors, (def, name) => {

    return class extends ExtendableError {

        constructor (e) {

            super(name, def, e);
        }

    }

});
