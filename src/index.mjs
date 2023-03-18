export { Data, isData, isSingleton, variant } from './Data.mjs';
export { Trait, all, apply, isTrait } from './Trait.mjs';
export { memoFix } from './memoFix.mjs';

/**
 * Used to declare inheritance from a parent.
 */
export const extend = Symbol('extend');