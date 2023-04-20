import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { extend } from "./index.mjs";
import { hasPrototype } from "./hasPrototype.mjs";

/**
 * Tests if the given string is capitalized
 * @param {string} str - The string to test
 * @returns {boolean} - True if the string is a valid identifier
 */
const isCapitalized = str => /^[A-Z][A-Za-z0-9]*/.test(str);

/**
 * Tests if the given string is camelCase
 * @param {string} str - The string to test
 * @returns {boolean} - True if the string is a valid identifier
 */
const isCamelCase = str => /^[a-z][A-Za-z0-9]*/.test(str);

const protoData = Object.create(null),
    protoVariant = Object.assign(Object.create(null), {
        /* Enables array destructuring */
        *[Symbol.iterator]() {
            for (const key in this) {
                const value = this[key];
                if (typeof value !== 'function')
                    yield this[key];
            }
        }
    })

/**
 * Normalizes the arguments passed to a variant constructor to an array of values
 * @param {string[]} propNames
 * @param {any[]} args
 * @param {string} VName - The name of the variant
 * @returns {any[]} - The normalized arguments
 */
function normalizeArgs(propNames, args, VName) {
    if (propNames.length === 1) {
        if (args.length === 1) {
            const arg = args[0];
            if (!isObjectLiteral(arg))
                return [arg];
            else
                return [propNames[0] in arg ? arg[propNames[0]] : arg];
        }
    } else {
        if (args.length === 1) {
            const objArg = args[0];
            if (!isObjectLiteral(objArg))
                throw new TypeError(
                    `Wrong number of arguments. expected: ${VName}(${propNames}) got: ${VName}(${args})`
                );
            if (Object.keys(objArg).length !== propNames.length)
                throw new TypeError(
                    `Wrong number of arguments. expected: ${VName}(${propNames}) got: ${VName}(${Object.keys(objArg)})`
                );
            return propNames.map((propName) => {
                if (!(propName in objArg))
                    throw new TypeError(`Missing parameter: ${propName}`);
                return objArg[propName];
            });
        } else if (args.length === propNames.length) {
            return [...args]
        } else {
            throw new TypeError(`Wrong number of arguments. expected: ${VName}(${propNames}), got: ${VName}(${args})`);
        }
    }
}

/**
 * Tests if the given object is a data object
 * @param {*} obj - The object to test
 * @returns {boolean} - True if the object is a data object
 */
export const isData = obj => hasPrototype(obj, protoData)

/**
 * Defines a data type
 * @param def The variants definition
 * @returns The data type
 */
export function data(def) {
    if (!isObjectLiteral(def))
        throw new TypeError('Data declaration must be an object literal');
    if (def[extend] && !isData(def[extend]))
        throw new TypeError('Data can only extend another Data declaration');

    const dataFactory = Object.create(def[extend] ?? protoData);

    for (const [VName, props] of Object.entries(def)) {
        if (!isCapitalized(VName))
            throw new TypeError(`variant name must be capitalized: ${VName}`);
        if (!isObjectLiteral(props))
            throw new TypeError(`variant properties must be an object literal: ${VName}`);

        const propNames = Object.keys(props)
        if (!propNames.every(isCamelCase))
            throw new TypeError(`variant properties must be camelCase strings: ${VName}: ${props}`);

        const pool = new BoxedMultiKeyMap();

        if (propNames.length === 0)
            dataFactory[VName] = readonly(Object.create(protoVariant));
        else
            dataFactory[VName] = (...args) => {
                const normalizedArgs = normalizeArgs(propNames, args, VName),
                    cached = pool.get(...normalizedArgs);
                if (cached) return cached;
                const obj = readonly(Object.defineProperties(Object.create(protoVariant),
                    propNames.reduce((acc, propName, i) => {
                        if (typeof normalizedArgs[i] === 'function')
                            acc[propName] = { get: normalizedArgs[i], enumerable: true };
                        else
                            acc[propName] = { value: normalizedArgs[i], enumerable: true };
                        return acc;
                    }, {})
                ))
                pool.set(...[...normalizedArgs, obj])

                return obj
            }
    }

    return readonly(dataFactory);
}

/**
 * Create a readonly object.
 * This is used instead of Object.freeze because it allows for wrapping proxies.
 * @see https://stackoverflow.com/a/75150991/153209
 * @param {*} obj
 * @returns
 */
const readonly = obj => new Proxy(obj, {
    defineProperty: () => false,
    deleteProperty: () => false,
    isExtensible: () => false,
    set: () => false
})
