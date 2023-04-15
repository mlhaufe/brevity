export { Data, isData, isSingleton, variant, variantName } from './data2.mjs';
export { Trait, apply, data, isTrait, _ } from './trait2.mjs';
export { memoFix } from './memoFix.mjs';

/**
 * Used to declare inheritance from a parent.
 */
export const extend = Symbol('extend');