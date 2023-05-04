/**
 * An implementation of instanceof for use with Symbol.hasInstance
 * @param {*} obj
 * @param {*} constructorFn
 * @returns
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