'use strict';

const fs = require('fs');

const clone = require('@ibrokethat/clone');
const {map, reduce} = require('@ibrokethat/iter');

const schemas = require('../../core/schemas');


const propType = (path, query, prop) => {

    if (new RegExp(`:${prop}`).test(path)) {
        return 'params';
    }
    else if (new RegExp(`[\?|&]${prop}`).test(path)) {
        return 'query';
    }

    return 'body';
};


const isRequired = (schema, prop) => {

    return !! (schema.required && schema.required.indexOf(prop) > -1);
};


const generateParameters = (c, method, def, schema) => {

    if (!schema) {
        return [];
    }

    const gen = (schema) => {

        return reduce(schema.properties, (acc, v, k) => {

            if (k === '$ref') {
                acc.push({
                    in: 'body',
                    name: 'body',
                    required: true,
                    schema: v
                });
            }
            else {

                let prop = clone(v);

                prop.in = propType(c.path, def.query, k);
                prop.name = k;
                prop.required = isRequired(schema, k);

                acc.push(prop);

                return acc;
            }

        }, []);
    };

    if (method === 'post') {
        return [{
            in: 'body',
            name: 'body',
            required: true,
            schema: schema
        }];
    }

    return gen(schema.allOf ? schema.allOf : schema);
};


module.exports = function generateSwagger (CONF) {

    let definitions = {};

    let swagger = {

        swagger: '2.0',
        info: {
            version: '1.0.0',
            title: 'yubl-ng',
            description: 'yubl api'
        },
        consumes: [
            'application/json'
        ],
        produces: [
          'application/json'
        ],
        paths: reduce(CONF.paths, (acc, c) => {

            acc[c.path] = reduce(c.methods, (acc, def, method) => {

                let inputSchemaName = `${def.cmd.replace('/', '.')}.input`;
                let inputSchema = schemas[inputSchemaName];

                let apiSchemaName;
                let apiSchema;

                if (def.transformer) {

                    apiSchemaName = `${def.transformer.replace('/', '.')}`;
                    apiSchema = schemas[apiSchemaName];

                    definitions[apiSchemaName] = apiSchema;
                }

                method = method.toLowerCase();

                acc[method] = {

                    description: def.description,

                    parameters: generateParameters(c, method, def, inputSchema),

                    responses: {
                        [method === 'post' ? 201 : 200]: {
                            schema: def.transformer ? {$ref: `#/definitions/${apiSchemaName}`} : {}
                        }
                    }
                };

                return acc;

            }, {});

            return acc;

        }, {}),

        definitions: map(definitions, (d) => {

            let def = clone(d);

            delete def.id;
            delete def.$schema;

            return def;
        })
    };

    fs.writeFileSync(`${process.cwd()}/swagger-spec.json`, JSON.stringify(swagger, null, 4));

    return swagger;
};
