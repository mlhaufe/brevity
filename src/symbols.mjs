/**
 * Used to declare a wildcard value
 */
export const _ = Symbol('_')

/**
 * Used to declare inheritance from a parent.
 */
export const extend = Symbol('extend')

/**
 * Used to reference the data declaration of a feature
 */
export const dataDecl = Symbol('dataDecl')

/**
 * Used to reference the trait declaration of a feature
 */
export const traitDecl = Symbol('traitDecl')

/**
 * Reference to the data variant used to create the complected data variant.
 */
export const dataVariant = Symbol('dataVariant')