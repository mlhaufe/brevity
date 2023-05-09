/**
 * Tests if the given object has the given prototype
 * @param {object} obj - The object to test
 * @param {object} proto - The prototype to test
 * @returns {boolean} - True if the object has the given prototype
 */
export const hasPrototype = (obj, proto) => obj === proto ? true :
    obj == null ? false :
        hasPrototype(Object.getPrototypeOf(obj), proto);
