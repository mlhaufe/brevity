import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { Trait, apply, extend } from "./index.mjs";

/**
 * Extends a trait to support the computation of a least fixed point with a bottom element and memoization
 * @param {Trait} trait The trait to extend
 * @param {any|() => any} bottom The bottom element of the least fixed point
 * @returns {Trait} The extended trait
 */
export const memoFix = (trait, bottom) => {
    const visited = new BoxedMultiKeyMap()
    return Trait(undefined, {
        [extend]: trait,
        [apply](...args) {
            if (!visited.has(...args)) {
                visited.set(...args, typeof bottom === 'function' ? bottom(...args) : bottom);
                visited.set(...args, trait[apply].apply(this, args));
            }
            return visited.get(...args);
        }
    })
}