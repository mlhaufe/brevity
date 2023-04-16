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

const protoVariant = {
    *[Symbol.iterator]() {
        for (const key of Object.keys(this)) {
            if (key !== variant && key !== variantName && key !== isSingleton)
                yield this[key];
        }
    }
}

function variantConstructor(params, name) {
    function self(...args) {
        let normalizedArgs = []
        const propNames = Object.keys(params);

        if (propNames.length === 1) {
            if (args.length === 1) {
                const arg = args[0];
                if (!isObjectLiteral(arg))
                    normalizedArgs.push(arg);
                else
                    normalizedArgs.push(propNames[0] in arg ? arg[propNames[0]] : arg);
            }
        } else {
            if (args.length === 1) {
                const objArg = args[0];
                assert(isObjectLiteral(objArg),
                    `Wrong number of arguments. expected: ${name}(${propNames}), got: ${name}(${args})`);

                assert(Object.keys(objArg).length === propNames.length,
                    `Wrong number of parameters. Expected: ${name}(${propNames}), got: ${name}(${Object.keys(objArg)})`);

                normalizedArgs = Object.entries(params).map(([propName, propCfg]) => {
                    assert(propName in objArg, `Missing parameter: ${propName}`);
                    assert(isObjectLiteral(propCfg) && Object.keys(propCfg).length === 0,
                        `Invalid property configuration: ${propName}`);
                    return objArg[propName];
                })
            } else if (args.length === propNames.length) {
                normalizedArgs.push(...args);
            } else {
                throw new TypeError(`Wrong number of arguments. expected: ${name}(${propNames}), got: ${name}(${args})`);
            }
        }

        let obj = self[pool].get(...normalizedArgs);
        if (obj) return obj;
        obj = Object.create(self.prototype);
        Object.entries(params).forEach(([propName, cfg], i) => {
            if (typeof normalizedArgs[i] === 'function')
                Object.defineProperty(obj, propName, { get: normalizedArgs[i], enumerable: true });
            else
                obj[propName] = normalizedArgs[i];
        });
        self[pool].set(...[...normalizedArgs, obj]);

        return Object.freeze(obj);
    };
    self[pool] = new BoxedMultiKeyMap();
    self.prototype = Object.freeze(Object.assign(Object.create(protoVariant), {
        [variant]: self,
        [variantName]: name,
        [isSingleton]: false
    }));

    return self
}

/**
 * Defines a data type
 * @param decl The variants definition
 * @returns The data type
 */
export function data(decl) {
    assert(isObjectLiteral(decl), 'Data declaration must be an object literal');

    // if every key is camelCase, then it's an anonymous variant
    const dataDecl = Object.keys(decl).every(isCamelCase) ? { 'Anonymous!': decl } : decl;

    assert(implies(extend in dataDecl, dataDecl[extend] && isData in dataDecl[extend]),
        'Data can only extend another Data declaration');

    const result = Object.create(extend in dataDecl ? dataDecl[extend] : null);
    if (!(isData in result))
        result[isData] = true;

    for (const [name, params] of Object.entries(dataDecl)) {
        assert(isCapitalized(name), `variant name must be capitalized: ${name}`);
        assert(isObjectLiteral(params), `variant properties must be an object literal: ${name}`)
        const propNames = Object.keys(params);
        assert(propNames.every(isCamelCase), `variant properties must be camelCase strings: ${name}: ${params}`);

        if (propNames.length === 0) {
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