import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { callable } from "./callable.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { apply, extend } from "./symbols.mjs";

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

const variantHandler = {
    apply(target, _thisArg, argumentsList) {
        return Reflect.apply(target[apply], target.constructor.prototype, argumentsList)
    }
}

export class Data { }

// TODO: extends Data and Function
class BaseVariant {
    constructor() {
        return new Proxy(this, variantHandler)
    }

    /* Enables array destructuring */
    *[Symbol.iterator]() {
        for (const key in this) {
            const value = this[key];
            if (typeof value !== 'function')
                yield this[key];
        }
    }

    [apply](instance, ...args) {
        return this[instance.constructor.name](instance, ...args)
    }
}

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
            if (typeof objArg !== 'object' || objArg == null)
                throw new TypeError(`Object expected, got ${objArg}`)

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
 * Defines a data type
 * @param def The variants definition
 * @returns The data type
 */
export function data(def) {
    if (!isObjectLiteral(def))
        throw new TypeError('Data declaration must be an object literal');
    if (def[extend] && !(def[extend] instanceof Data))
        throw new TypeError('Data can only extend another Data declaration');

    class Factory extends (def[extend]?.constructor ?? Data) {
        static {
            for (const [VName, props] of Object.entries(def)) {
                if (!isCapitalized(VName))
                    throw new TypeError(`variant name must be capitalized: ${VName}`);
                if (!isObjectLiteral(props))
                    throw new TypeError(`variant properties must be an object literal: ${VName}`);

                const propNames = Object.keys(props)
                if (!propNames.every(isCamelCase))
                    throw new TypeError(`variant properties must be camelCase strings: ${VName}: ${props}`);

                const pool = new BoxedMultiKeyMap();

                const Variant = callable(class extends BaseVariant {
                    constructor(...args) {
                        super()
                        const normalizedArgs = normalizeArgs(propNames, args, VName);
                        const cached = pool.get(...normalizedArgs);
                        if (cached) return cached;

                        Object.defineProperties(this,
                            propNames.reduce((acc, propName, i) => {
                                if (typeof normalizedArgs[i] === 'function')
                                    acc[propName] = { get: normalizedArgs[i], enumerable: true };
                                else
                                    acc[propName] = { value: normalizedArgs[i], enumerable: true };
                                return acc;
                            }, {})
                        )
                        pool.set(...[...normalizedArgs, this])
                    }
                })
                Object.defineProperty(Variant, 'name', { value: VName });

                if (propNames.length === 0)
                    this.prototype[VName] = Variant();
                else
                    this.prototype[VName] = Variant
            }
        }
    }

    return new Factory();
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
