import { isComplectedVariant } from "./complect.mjs";
import { isDataVariant } from "./data.mjs";
import { isConstructor } from "./isConstructor.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { isPrimitive } from "./isPrimitive.mjs";
import { _ } from "./symbols.mjs";

/**
 * A constructor function that creates instances of type `T`.
 * @template T The type of instances created by the constructor.
 * @typedef {new (...args: any[]) => T} Constructor
 */

/**
 * A Primitive value
 * @typedef {boolean | bigint | number | string | symbol | undefined} Primitive
 */

/**
 * An object literal with string keys and arbitrary values.
 * @typedef {Object.<string, *>} ObjectLiteral
 */

/**
 * A pattern that can be used in a pattern matching expression.
 * @typedef {Primitive | object | Constructor<any> | any[] | ObjectLiteral} Pattern
 */

/**
 * Tests if a value is a pattern
 * @param {Pattern} p
 * @returns {boolean}
 */
const isPattern = (p) => {
    return isPrimitive(p) || isObjectLiteral(p)
        || Array.isArray(p) || isConstructor(p) || p === _
        || isDataVariant(p) || isComplectedVariant(p)
}

const satisfiesPrimitive = (Cons, value) => {
    const typeString = Cons.name.toLowerCase();
    return (typeof value === typeString || value instanceof Cons)
}

/**
 * Unifies a pattern with an argument.
 * @param {Pattern} p The pattern to unify with.
 * @param {*} a The argument to unify with.
 * @returns {boolean} True if the pattern and argument unify, false otherwise.
 */
const unify = (p, a) => {
    if (p === _ || a === _) {
        return true
    } else if (isPrimitive(p)) {
        return p === a
    } else if (isDataVariant(p) || isComplectedVariant(p)) {
        if (!isDataVariant(a) && !isComplectedVariant(a))
            return false
        // TODO: need a dataDecl comparison and not just a name comparison
        if (p.constructor.name !== a.constructor.name)
            return false
        for (const [k, v] of Object.entries(p)) {
            if (!(k in a))
                return false
            if (!unify(v, a[k]))
                return false
        }
        return true
    } else if (isConstructor(p)) {
        if (isPrimitive(a))
            return satisfiesPrimitive(p, a)
        return a instanceof p
    } else if (isObjectLiteral(p)) {
        if (typeof a !== 'object' || a === null)
            return false
        for (const [k, v] of Object.entries(p)) {
            if (!(k in a))
                return false
            if (!unify(v, a[k]))
                return false
        }
        return true
    } else if (Array.isArray(p)) {
        // argument must be iterable
        if (!a?.[Symbol.iterator])
            return false

        const aKeys = Object.keys(a),
            pKeys = Object.keys(p)
        if (pKeys.length !== aKeys.length)
            return false
        for (let i = 0; i < pKeys.length; i++) {
            const k = aKeys[i]
            if (!unify(p[pKeys[i]], a[k]))
                return false
        }
        return true
    } else {
        return false
    }
}

/**
 * Tests if a pattern contains a wildcard.
 * @param {*} arg
 * @returns {boolean}
 */
const containsWildcard = (arg) => {
    if (arg === _)
        return true;
    else if (Array.isArray(arg))
        return arg.some(containsWildcard);
    else if (typeof arg === 'object' && arg !== null)
        return Object.values(arg).some(containsWildcard);
    else
        return false;
}

/**
 * A pattern case is an array of patterns followed by a function.
 * @typedef {[...Pattern[], (...args: any[]) => any]} PatternCase
 */

/**
 * Converts a pattern declaration into a function.
 * @param {string} name - The ultimate name of the function
 * @param {((...args: any[]) => any) | PatternCase[]} patternDefOrFn - The pattern declaration or function
 * @returns {(...args: any[]) => any} A function that performs pattern matching.
 */
export const defPatternFunc = (name, patternDefOrFn) => {
    if (typeof patternDefOrFn === 'function')
        return patternDefOrFn;

    if (!Array.isArray(patternDefOrFn))
        throw new TypeError(`Invalid Trait declaration. '${String(name)}' must be a function or pattern`);

    const badPatternMsg = `Invalid Trait declaration for '${String(name)}'.`

    // [...[p1, p2, ... pn, fn]]
    const patterns = patternDefOrFn;
    if (patterns.length === 0)
        throw new TypeError(`${badPatternMsg} A pattern must be an array of length >= 2: ${JSON.stringify(patterns)}`);

    for (const pf of patterns) {
        // [p1, p2, ... pn, fn]
        if (!Array.isArray(pf) || pf.length < 2)
            throw new TypeError(`${badPatternMsg} pattern must be an array of length >= 2: ${JSON.stringify(pf)}`);
        // p1, p2, ... pn
        if (!pf.slice(0, -1).every(isPattern))
            throw new TypeError(`${badPatternMsg} A pattern must be a primitive, variant, object literal, or array: ${JSON.stringify(pf)}`);

        if (typeof pf[pf.length - 1] !== 'function')
            throw new TypeError(`${badPatternMsg} The last element of a pattern must be a function: ${JSON.stringify(pf)}`);

        // Every pf must have the same length
        if (pf.length !== patterns[0].length)
            throw new TypeError(`${badPatternMsg} All patterns must have the same arity: ${JSON.stringify(pf)}`);
    }

    function fn(...args) {
        // find the first pattern that unifies with the args
        // then return the result of calling the function with the args
        for (const pf of patterns) {
            /** @type {Pattern[]} */
            const ps = pf.slice(0, -1),
                /** @type {*} */
                f = pf.at(-1);
            if (ps.every((p, i) => unify(p, args[i])))
                return f.apply(this, args);
        }

        throw new TypeError(
            `no matching pattern defined for ${args[0]} with arguments ${JSON.stringify(args)}`
        );
    }
    // change the argument length of the function to match the pattern length
    // so that partial application knows how many to expect
    Object.defineProperty(fn, 'length', { value: patterns[0].length - 1 })

    return fn
}