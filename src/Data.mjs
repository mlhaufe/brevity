import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { assert } from "./assert.mjs";
import { implies } from "./implies.mjs";
import { extend } from "./index.mjs";

const isCapitalized = str => typeof str === 'string' && str.match(/^[A-Z][A-Za-z0-9]*/),
    isCamelCase = str => typeof str === 'string' && str.match(/^[a-z][A-Za-z0-9]*/),
    pool = Symbol('pool');

export const variant = Symbol('variant'),
    variantName = Symbol('variantName'),
    isData = Symbol('isData'),
    isSingleton = Symbol('isSingleton');

function variantConstructor(params, name) {
    function self(...args) {
        const normalizedArgs = [];

        if (params.length === 1) {
            if (args.length === 1) {
                const arg = args[0];
                if (!isObjectLiteral(arg))
                    normalizedArgs.push(arg);
                else
                    normalizedArgs.push(params[0] in arg ? arg[params[0]] : arg);
            }
        } else {
            if (args.length === 1) {
                const objArg = args[0];
                assert(isObjectLiteral(objArg),
                    `Wrong number of arguments. expected: ${name}(${params}), got: ${name}(${args})`);

                assert(Object.keys(objArg).length === params.length,
                    `Wrong number of parameters. Expected: ${name}(${params}), got: ${name}(${Object.keys(objArg)})`);

                for (const param of params) {
                    assert(param in objArg, `Missing parameter: ${param}`);
                    normalizedArgs.push(objArg[param]);
                }
            } else if (args.length === params.length) {
                normalizedArgs.push(...args);
            } else {
                throw new TypeError(`Wrong number of arguments. expected: ${name}(${params}), got: ${name}(${args})`);
            }
        }

        let obj = self[pool].get(...normalizedArgs);
        if (obj) return obj;
        obj = Object.create(self.prototype);
        params.forEach((param, i) => {
            if (typeof normalizedArgs[i] === 'function')
                Object.defineProperty(obj, param, { get: normalizedArgs[i], enumerable: true });
            else
                obj[param] = normalizedArgs[i];
        });
        self[pool].set(...[...normalizedArgs, obj]);

        return Object.freeze(obj);
    };
    self[pool] = new BoxedMultiKeyMap();
    self.prototype = Object.freeze({ [variant]: self, [variantName]: name, [isSingleton]: false });

    return self
}

/**
 * Defines a data type
 * @param decl The variants definition
 * @returns The data type
 */
export function Data(decl) {
    const dataDecl = Array.isArray(decl) ? { 'Anonymous!': decl } : decl;

    assert(isObjectLiteral(dataDecl), 'Data declaration must be an object literal or an array');
    // TODO: how to extend anonymous variant? Maybe each variant should have a reference to the base?

    assert(implies(extend in dataDecl, dataDecl[extend] && isData in dataDecl[extend]),
        'Data can only extend another Data declaration');

    const result = Object.create(extend in dataDecl ? dataDecl[extend] : null);
    if (!(isData in result))
        result[isData] = true;

    for (const [name, params] of Object.entries(dataDecl)) {
        assert(isCapitalized(name), `variant name must be capitalized: ${name}`);
        assert(Array.isArray(params), `variant properties must be an array: ${name}`)
        assert(params.every(isCamelCase), `variant properties must be camelCase strings: ${name}: ${params}`);
        assert(new Set(params).size === params.length, `variant properties must be unique: ${name}: ${params}`)

        if (params.length === 0) {
            const obj = result[name] = Object.create(null)
            Object.assign(obj, ({ [variant]: obj, [variantName]: name, [isSingleton]: true }))
            Object.freeze(obj)
        } else {
            result[name] = Object.freeze(variantConstructor(params, name))
        }
    }

    if (Object.keys(result).length === 1 && 'Anonymous!' in result)
        return result['Anonymous!'];

    return Object.freeze(result);
}