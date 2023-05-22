/**
 * @template T
 * @typedef {import("./symbols.mjs").Constructor<T>} Constructor
 */

// @returns {(...args: Parameters<Constructor<T>>) => T} - The callable class

/**
 * Make a class callable
 * @template T
 * @param {Constructor<T>} Clazz
 * @returns - The callable class
 */
export function callable(Clazz) {
    function Create(...args) {
        return new Clazz(...args);
    }
    Object.setPrototypeOf(Create, Clazz);
    Object.setPrototypeOf(Create.prototype, Clazz.prototype);
    Object.defineProperties(Create, {
        name: { value: Clazz.name },
        length: { value: Clazz.length },
        [Symbol.hasInstance]: { value(instance) { return instance instanceof Clazz } }
    })

    return Create;
}