/**
 * Tests if the given object has the given prototype
 * @param {object} obj - The object to test
 * @param {object} proto - The prototype to test
 * @returns {boolean} - True if the object has the given prototype
 */
export const hasPrototype = (obj, proto) => obj === proto ? true :
    obj == null ? false :
        hasPrototype(Object.getPrototypeOf(obj), proto);

/**
 * An implementation of instanceof for use with Symbol.hasInstance
 * @param {*} obj - The object to test
 * @param {*} constructorFn - The constructor function to test
 * @returns {boolean}
 */
export function instanceOf(obj, constructorFn) {
    let prototype = Object.getPrototypeOf(obj);
    while (prototype !== null) {
        if (prototype === constructorFn.prototype) {
            return true;
        }
        prototype = Object.getPrototypeOf(prototype);
    }
    return false;
}

/**
 * Tests if the given string is camelCase
 * @param {string} str - The string to test
 * @returns {boolean} - True if the string is a valid identifier
 */
export const isCamelCase = str => /^[a-z][A-Za-z0-9]*/.test(str);

/**
 * Tests if the given string is capitalized
 * @param {string} str - The string to test
 * @returns {boolean} - True if the string is a valid identifier
 */
export const isCapitalized = str => /^[A-Z][A-Za-z0-9]*/.test(str);

const _handler = { construct() { return _handler } }

/**
 * Tests if `x` is a constructor.
 * @param {*} x The value to test.
 * @returns {boolean}
 */
export const isConstructor = x => {
    try {
        return !!(new (new Proxy(x, _handler))())
    } catch (e) {
        return false
    }
}

/**
 * Tests if the given object is an object literal.
 * @param {*} obj - The object to test
 * @returns {boolean}
 */
export const isObjectLiteral = obj => obj != null && Object.getPrototypeOf(obj) === Object.prototype;

const _typeofList = ['boolean', 'bigint', 'number', 'string', 'symbol', 'undefined']

/**
 * Tests if the given value is a primitive.
 * @param {*} p - The value to test
 * @returns {boolean}
 */
export const isPrimitive = (p) => {
    return p === null || _typeofList.includes(typeof p);
};

/**
 * Tests if a prototype is in the prototype chain of an object.
 * @param {object} child - The object to test.
 * @param {object} parent - The prototype to test.
 * @returns {boolean}
 */
export const isPrototypeOf = (child, parent) => Object.prototype.isPrototypeOf.call(parent, child)

/**
 * Tests if a value satisfies a primitive type.
 * @param {*} value - The value to test.
 * @param {Function} Cons - The primitive type to test.
 * @returns {boolean} - True if the value satisfies the primitive type, false otherwise.
 */
export const satisfiesPrimitive = (value, Cons) => {
    const typeString = Cons.name.toLowerCase();
    return (typeof value === typeString || value instanceof Cons)
}