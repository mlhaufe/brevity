export { data, isData, isSingleton, variant, variantName } from './data.mjs';
export { trait, apply, dataDecl, isTrait, _ } from './trait.mjs';
export { memoFix } from './memoFix.mjs';

/**
 * Used to declare inheritance from a parent.
 */
export const extend = Symbol('extend');