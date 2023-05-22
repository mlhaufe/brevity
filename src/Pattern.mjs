import { callable } from "./callable.mjs";
import { Complected } from "./complect.mjs";
import { Data } from "./data.mjs";
import { isConstructor, isObjectLiteral, isPrimitive } from "./predicates.mjs";
import { _ } from "./symbols.mjs";

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
 * @typedef {Primitive | object | import("./symbols.mjs").Constructor<any> | any[] | ObjectLiteral} Patt
 */

/**
 * A pattern case is an array of patterns followed by a function.
 * @typedef {[...Patt[], (...args: any[]) => any]} PattCase
 */

/**
 * Tests if a value is a pattern
 * @param {Patt} p
 * @returns {boolean}
 */
const isPattern = (p) => {
    return isPrimitive(p) || isObjectLiteral(p)
        || Array.isArray(p) || isConstructor(p) || p === _
        || p instanceof Data || p instanceof Complected
}

const satisfiesPrimitive = (Cons, value) => {
    const typeString = Cons.name.toLowerCase();
    return (typeof value === typeString || value instanceof Cons)
}

/**
 * Unifies a pattern with an argument.
 * @param {Patt} p The pattern to unify with.
 * @param {*} a The argument to unify with.
 * @returns {boolean} True if the pattern and argument unify, false otherwise.
 */
const unify = (p, a) => {
    if (p === _ || a === _) {
        return true
    } else if (isPrimitive(p)) {
        return p === a
    } else if (p instanceof Data || p instanceof Complected) {
        if (!(a instanceof Data) && !(a instanceof Complected))
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
 * Pattern Matching Declaration
 *
 * @example
 * const Evaluable = trait('evaluate', {
 *   Fib: Pattern(($) => [
 *     [{ n: 0 }, (self) => 0],
 *     [{ n: 1 }, (self) => 1],
 *     [_, ({ n }) => $.Fib(n - 1).evaluate() + $.Fib(n - 2).evaluate()]
 *   ])
 * })
 *
 */
export const Pattern = callable(class {
    #fnPatternDecl

    /**
     * @param {(family: any) => PattCase[]} fnPatternDecl
     */
    constructor(fnPatternDecl) {
        this.#fnPatternDecl = fnPatternDecl
    }

    match(family) {
        const patternDef = this.#fnPatternDecl(family),
            badPatternMsg = `Invalid Pattern declaration.`
        if (!Array.isArray(patternDef))
            throw new TypeError(`${badPatternMsg} Must be an array: ${JSON.stringify(patternDef)}`);
        if (patternDef.length === 0)
            throw new TypeError(`${badPatternMsg} Must have at least one pattern: ${JSON.stringify(patternDef)}`);
        // [...[p1, p2, ... pn, fn]]
        const patterns = patternDef,
            arity = patterns[0].length - 1

        for (const pf of patterns) {
            // [p1, p2, ... pn, fn]
            if (!Array.isArray(pf) || pf.length < 2)
                throw new TypeError(`${badPatternMsg} A pattern must be an array of length >= 2: ${JSON.stringify(pf)}`);
            // p1, p2, ... pn
            if (!pf.slice(0, -1).every(isPattern))
                throw new TypeError(`${badPatternMsg} A pattern must be a primitive, variant, object literal, or array: ${JSON.stringify(pf)}`);
            if (typeof pf[pf.length - 1] !== 'function')
                throw new TypeError(`${badPatternMsg} The last element of a pattern must be a function: ${JSON.stringify(pf)}`);
            if (pf.length - 1 !== arity)
                throw new TypeError(`${badPatternMsg} All patterns must have the same arity. Expected ${arity}, got ${pf.length - 1}: ${JSON.stringify(pf)}`);
        }

        function fn(...args) {
            // find the first pattern that unifies with the args
            // then return the result of calling the function with the args
            for (const pf of patterns) {
                /** @type {Patt[]} */
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
        Object.defineProperty(fn, 'length', { value: arity })

        return fn
    }
})