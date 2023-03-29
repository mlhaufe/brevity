export { Data, isData, isSingleton, variant, variantName } from './Data.mjs';
export { Trait, apply, data, isTrait } from './Trait.mjs';
export { memoFix } from './memoFix.mjs';

/**
 * Used to declare inheritance from a parent.
 */
export const extend = Symbol('extend');