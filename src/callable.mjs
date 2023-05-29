/**
 * @template T
 * @typedef {import("./symbols.mjs").Constructor<T>} Constructor
 */

// @returns {(...args: Parameters<Constructor<T>>) => T} - The callable class

const _callHandler = {
    apply(Target, _thisArg, argArray) {
        return Reflect.construct(Target, argArray,)
    }
}

/**
 * Make a class callable
 * @template T
 * @param {Constructor<T>} Clazz
 * @returns - The callable class
 */
export function callable(Clazz) {
    return new Proxy(Clazz, _callHandler)
}