import MultiKeyMap from "@final-hill/multi-key-map"
import { Trait, apply } from "./Trait.mjs";

const visited = Symbol('visited');
/**
 * Extends a trait to support the computation of a least fixed point with a bottom element and memoization
 * @param {Trait} trait The trait to extend
 * @param {any|() => any} bottom The bottom element of the least fixed point
 * @returns {Trait} The extended trait
 */
export const memoFix = (trait, bottom) => Trait(trait, {
    [visited]: new MultiKeyMap(),
    [apply](...args) {
        const v = this[visited];
        if (!v.has(...args)) {
            v.set(...args, typeof bottom === 'function' ? bottom(...args) : bottom);
            v.set(...args, trait[apply].apply(this, args));
        }
        return v.get(...args);
    }
})