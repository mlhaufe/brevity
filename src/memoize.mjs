import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";

/**
 * Memoizes a function
 * @param {(...args: any[]) => any} fn - The function to memoize
 * @returns {(...args: any[]) => any} - The memoized function
 */
export function memoize(fn) {
    const cache = new BoxedMultiKeyMap();

    function _memo(...args) {
        if (cache.has(...args))
            return cache.get(...args);
        const result = fn(...args);
        cache.set(...args, result);
        return result;
    };

    Object.defineProperty(_memo, 'name', { value: fn.name })

    return _memo
}