/**
 * Used to declare a wildcard value
 */
export const _ = Symbol('_')

/**
 * Used to reference the data declaration of a feature
 */
export const dataDecl = Symbol('dataDecl')

/**
 * Used to reference the trait declaration of a feature
 */
export const traitDecls = Symbol('traitDecls')

/**
 * Reference to the data variant used to create the complected data variant.
 */
export const dataVariant = Symbol('dataVariant')

/**
 * A constructor function that creates instances of type `T`.
 * @template T The type of instances created by the constructor.
 * @typedef {new (...args: any[]) => T} Constructor
 */