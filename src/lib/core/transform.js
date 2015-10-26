'use strict';

const path = require('path');

const CONF = require('config');

const curry = require('@ibrokethat/curry');
const {forEach, map} = require('@ibrokethat/iter');
const validator = require('is-my-json-valid');
const requireAll = require('require-all');

const e = require('./errors');

const schemas = require('./loadSchemas')();
const transformers = requireAll(path.join(process.cwd(), CONF.paths.transformers));
const validators = map(schemas, (schema) => validator(schema, {schemas: schemas}));




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


const transform = curry(function* (transformer, cfg, ctx, res) {

    if (!transformers[transformer]) {

        throw new ReferenceError(`${transformer} does not exist`);
    }

    let schema = schemas[transformer];

    res = yield transformers[transformer](cfg, ctx, res);

    for (let key in res) {

        let value = res[key]
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

                let nextTransformer = next(transformer, v);

                if (nextTransformer) {

                    res[key] = yield transform(nextTransformer, cfg, ctx, value);
                }
            }
            else if (k === 'type' && v === 'array') {

                if (prop.items && prop.items.$ref) {

                    let nextTransformer = next(transformer, prop.items.$ref);

                    if (nextTransformer) {

                        res[key] = yield map(value, transform(nextTransformer, cfg, ctx));
                    }
                }
            }

        }

    }

    return res;
});


module.exports = function* (transformer, cfg, ctx, res) {

    res = yield transform(transformer, cfg, ctx, res);

    if (!validators[transformer](res)) {

        throw new e.InvalidOutputError(validators[transformer].errors);
    }

    return res;
};
