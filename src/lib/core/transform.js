'use strict';

const path = require('path');

const CONF = require('config');

const curry = require('@ibrokethat/curry');
const {map} = require('@ibrokethat/iter');
const value = require('useful-value');

const requireAll = require('require-all');

const e = require('./errors');

const schemas = require('./schemas');
const validators = require('./validators');
const validatorErrors = require('./validatorErrors');

const transformers = requireAll(path.join(global.ROOT, CONF.paths.transformers));

function next (transformer, v) {

    if (v === '#') { // use same schema

        return transformer;
    }
    else if (!/^\/#definitions\//.test(v)) {

        let nextTransformer = v.split('#').pop();

        return nextTransformer;
    }
    else {

        return false;
    }

}


const transform = curry(function* (transformerName, cfg, ctx, res) {

    let path = transformerName.replace('/', '.');
    let transformer = value(transformers, path);

    if (!transformer) {

        throw new ReferenceError(`${transformerName} does not exist`);
    }

    let schema = value(schemas, path);

    if (schema.type === 'array' && schema.items && schema.items.$ref) {

        let nextTransformer = next(transformerName, schema.items.$ref);

        if (nextTransformer) {

            res = yield map(res, transform(nextTransformer, cfg, ctx));
        }

    }
    else {

        res = yield transformer(cfg, ctx, res);

        for (let key in res) {

            let value = res[key];

            let prop = schema.properties[key];

            for(let k in prop) {

                let v = prop[k];

                if (k === 'oneOf') {

                    /*
                        todo, need to think this one through
                        if there is more than one ref specified we need an easy
                        way of choosing which one to use at run time
                        probably need a factory style transformer


                        let fnTransformer = fac(new Map([
                            [
                                (data) => data.doesSomePropExist, // transformers.user.match
                                (data) => {transform(transformers.user.transform, schemas[user.api], cfg, ctx, data)}
                            ],
                            [
                                (data) => true, // transformers.href.match
                                (data) => {transform(transformers.href.transform, schemas[href.api], cfg, ctx, data)}
                            ]
                        ]));

                        which would mean the transformers would need to export 2 methods
                        match and transform

                    */

                }

                if (k === '$ref') {

                    let nextTransformer = next(transformerName, v);

                    if (nextTransformer) {

                        res[key] = yield transform(nextTransformer, cfg, ctx, value);
                    }
                }
                else if (k === 'type' && v === 'array') {

                    if (prop.items && prop.items.$ref) {

                        let nextTransformer = next(transformerName, prop.items.$ref);

                        if (nextTransformer) {

                            res[key] = yield map(value, transform(nextTransformer, cfg, ctx));
                        }
                    }
                }

            }
        }
    }


    return res;
});


module.exports = function* (transformer, cfg, ctx, res) {

    let logMsg = {
        event: 'cmd-server:transformer',
        data: {
            transformer: transformer,
            success: true
        }
    };

    try {

        res = yield transform(transformer, cfg, ctx, res);

        let validator = value(validators, transformer.replace('/', '.'));

        if (!validator(res)) {

            throw new e.InvalidTransformError(validatorErrors(validator));
        }

        return res;
    }
    catch (err) {

        logMsg.level = 'error';
        logMsg.data.success = false;
        logMsg.data.error = err;

        throw err;
    }
    finally {

        process.emit('cmd-server:log', logMsg);
    }

};
