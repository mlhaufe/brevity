import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { Trait, apply } from "./index.mjs"

const visited = Symbol('visited');
/**
 * Extends a trait to support the computation of a least fixed point with a bottom element and memoization
 * @param trait The trait to extend
 * @param bottom The bottom element of the least fixed point
 * @returns The extended trait
 */
export const memoFix = (trait, bottom) => Trait(trait, {
    [visited]: new BoxedMultiKeyMap(),
    [apply](...args) {
        const v = this[visited];
        if (!v.has(...args)) {
            v.set(...args, typeof bottom === 'function' ? bottom(...args) : bottom);
            v.set(...args, trait[apply].apply(this, args));
        }
        return v.get(...args);
    }
})