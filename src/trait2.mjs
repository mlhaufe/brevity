import { isObjectLiteral } from './isObjectLiteral.mjs';
import { assert } from './assert.mjs';
import { extend, variant, variantName, isData } from './index.mjs';

export const isTrait = Symbol('isTrait'),
    data = Symbol('data'),
    apply = Symbol('apply'),
    _ = Symbol('_');

const getAncestorFunctions = (() => {
    const cache = new WeakMap()
    return (obj) => {
        if (cache.has(obj))
            return cache.get(obj)
        const fnValues = Object.values(obj).filter(v => typeof v === 'function'),
            proto = Reflect.getPrototypeOf(obj)
        if (proto !== null && isTrait in proto)
            cache.set(obj, fnValues.concat(getAncestorFunctions(proto)))
        else
            cache.set(obj, fnValues)
        return cache.get(obj)
    }
})()

function accumulator(fn, savedArgs, remainingCount) {
    return function (...args) {
        const newRemainingCount = args.reduce(
            (sum, arg) => arg !== _ ? sum - 1 : sum,
            remainingCount
        );
        const argClone = [...args];
        const newSavedArgs = savedArgs.map(
            arg => arg === _ ? argClone.shift() : arg
        );

        return newRemainingCount === 0 ? fn(...newSavedArgs) :
            accumulator(fn, newSavedArgs, newRemainingCount);
    };
}

const wildcardFn = () => _

function partial(fn) {
    return fn.length === 0 ? fn :
        accumulator(fn, Array.from({ length: fn.length }, wildcardFn), fn.length);
}

const protoTrait = () => { }
protoTrait[isTrait] = true;
protoTrait[apply] = function self(instance, ...args) {
    let fn
    const dataType = this[data]

    if (dataType == undefined) {
        fn = this['_']
    } else if (dataType[isData]) {
        if (typeof instance === 'object' && instance !== null && variant in instance)
            fn = this[instance[variantName]]
        else
            throw new TypeError(`instance must be a data variant: ${instance[variantName]}`)
    } else if (dataType.prototype[variant]) { // anonymous data declaration
        if (typeof instance === 'object' && instance !== null && variant in instance) {
            const fns = getAncestorFunctions(this);
            // Since only 1 function can be defined for a variant,
            // there should only ever be 1 entry in fns
            fn = fns[0]
        } else {
            throw new TypeError(`instance must be a data variant: ${instance[variantName]}`)
        }
    } else if ([Number, String, Boolean, BigInt].includes(dataType)) {
        const type = dataType,
            typeString = type.name.toLowerCase();
        if (typeof instance === typeString || instance instanceof type)
            fn = this[`${instance.toString()}${typeof instance === 'bigint' ? 'n' : ''}`];
        else
            throw new TypeError(`instance must be a ${typeString}: ${instance}`);
    } else {
        throw new TypeError(`data must be a data declaration or primitive type: ${String(dataType)}`)
    }

    if (fn) return fn.call(this, instance, ...args);

    // fallback to wildcard
    if ('_' in this) return this['_'].call(this, instance, ...args);

    throw new TypeError(`no trait defined for ${instance[variantName]}`)
}

const primCons = [Number, String, Boolean, BigInt],
    typeofList = ['boolean', 'bigint', 'number', 'string', 'symbol', 'undefined'],
    msgWildcardInvalid = `Invalid Trait declaration. Wildcard '_' must be a function`;

function assignTraitDefs(traitDef, localTraits, dataDecl) {
    // We iterate over traitDef instead of dataDecl so we can associate the variant
    // since it could have overridden entries from a parent
    for (const [name, f] of Object.entries(traitDef)) {
        localTraits[name] = createTraitFn(name, f);
        f[variant] = dataDecl?.[name];
    }
}

const isPrimitive = (p) => {
    return p === null || typeofList.includes(typeof p)
}

const isPattern = (p) => {
    return isPrimitive(p) || variant in p || isObjectLiteral(p) || Array.isArray(p)
}

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
 * Unifies a pattern with an argument.
 * @param p The pattern to unify with.
 * @param a The argument to unify with.
 * @returns {boolean} True if the pattern and argument unify, false otherwise.
 */
const unify = (p, a) => {
    if (p === _)
        return true
    if (isPrimitive(p))
        return p === a
    if (variant in p) {
        if (containsWildcard(p)) {
            if (typeof a !== 'object' || a === null)
                return false
            if (!(variant in a))
                return false
            if (p[variant] !== a[variant])
                return false
            for (const [k, v] of Object.entries(p)) {
                if (k === variant)
                    continue
                if (!(k in a))
                    return false
                if (!unify(v, a[k]))
                    return false
            }
            return true
        }

        return p === a
    }
    if (isObjectLiteral(p)) {
        if (typeof a !== 'object' || a === null)
            return false
        for (const [k, v] of Object.entries(p)) {
            if (!(k in a))
                return false
            if (!unify(v, a[k]))
                return false
        }
        return true
    }
    if (Array.isArray(p)) {
        // argument must be an array or a variant
        // if it's a variant, compare the properties to the array elements
        if (typeof a !== 'object' || a === null)
            return false
        if (variant in a) {
            const keys = Object.keys(a)
            if (p.length !== keys.length)
                return false
            for (let i = 0; i < p.length; i++) {
                const k = keys[i]
                if (!unify(p[i], a[k]))
                    return false
            }
            return true
        }
        if (!Array.isArray(a))
            return false
        if (p.length !== a.length)
            return false
        for (let i = 0; i < p.length; i++) {
            if (!unify(p[i], a[i]))
                return false
        }
        return true
    }
    return false
}

const createTraitFn = (name, patternDefOrFn) => {
    if (typeof patternDefOrFn === 'function')
        return patternDefOrFn;

    const badPatternMsg = `Invalid Trait declaration for '${String(name)}'. `

    if (Array.isArray(patternDefOrFn)) {
        // [...[p1, p2, ... pn, fn]]
        const patterns = patternDefOrFn;
        assert(patterns.length > 0, badPatternMsg);

        for (const pf of patterns) {
            // [p1, p2, ... pn, fn]
            assert(Array.isArray(pf) && pf.length >= 2,
                `${badPatternMsg} pattern must be an array of length >= 2: ${JSON.stringify(pf)}`
            );
            // p1, p2, ... pn
            assert(pf.slice(0, -1).every(isPattern),
                `${badPatternMsg} A pattern must be a primitive, variant, object literal, or array: ${JSON.stringify(pf)}`
            );
            assert(typeof pf[pf.length - 1] === 'function',
                `${badPatternMsg} The last element of a pattern must be a function: ${JSON.stringify(pf)}`
            );
            // Every pf must have the same length
            assert(pf.length === patterns[0].length,
                `${badPatternMsg} All patterns must have the same arity: ${JSON.stringify(pf)}`
            );
        }

        function fn(...args) {
            // find the first pattern that unifies with the args
            // then return the result of calling the function with the args
            for (const pf of patterns) {
                const ps = pf.slice(0, -1),
                    f = pf[pf.length - 1];
                if (ps.every((p, i) => unify(p, args[i])))
                    return f.apply(this, args);
            }

            throw new TypeError(
                `no matching pattern defined for ${args[0][variantName]} with arguments ${JSON.stringify(args)}`
            );
        }
        // change the argument length of the function to match the pattern length
        // so that partial application knows how many to expect
        Object.defineProperty(fn, 'length', { value: patterns[0].length - 1 })

        return fn
    }

    throw new TypeError(`Invalid Trait declaration. '${String(name)}' must be a function or pattern`);
}

/**
 * Defines a trait for a data declaration.
 * @param {object} dataDecl The data declaration to define the trait for.
 * @param {object} traifDef The traits to define.
 * @throws {TypeError} if traits is not an object literal
 * @throws {TypeError} if dataDecl is not a data declaration
 * @throws {TypeError} if any trait is not a function
 * @returns {function} a trait function
 */
export function Trait(dataDecl, traitDef) {
    let localTraits = (...args) => localTraits[apply](...args)

    assert(isObjectLiteral(traitDef), 'traitDef must be an object literal');

    if ("_" in traitDef)
        localTraits['_'] = createTraitFn('_', traitDef['_'])

    if (apply in traitDef)
        localTraits[apply] = createTraitFn(apply, traitDef[apply])

    Reflect.setPrototypeOf(localTraits,
        extend in traitDef ? traitDef[extend] : protoTrait
    )

    localTraits[data] = dataDecl

    if (dataDecl == undefined) {
        assert('_' in traitDef || apply in traitDef,
            "Wildcard '_' or Symbol(apply) must be defined if dataDecl is undefined");
        return localTraits
    } else if (isData in dataDecl) {
        if (!('_' in traitDef)) {
            // every key in dataDecl must be in traitDef
            Object.keys(dataDecl).forEach(name => {
                assert(traitDef[name] != null, `Invalid Trait declaration. Missing definition for '${String(name)}'`);
            })
        }

        assignTraitDefs(traitDef, localTraits, dataDecl);
    } else if (variant in dataDecl.prototype) {
        assert(Object.keys(traitDef).length === 1, `Only one trait may be defined for a variant declaration`);
        assignTraitDefs(traitDef, localTraits, dataDecl);
    } else if (primCons.includes(dataDecl)) {
        if (!('_' in traitDef)) {
            if (dataDecl === Boolean)
                assignTraitDefs(traitDef, localTraits, undefined)
            else
                throw new TypeError(msgWildcardInvalid);
        } else {
            assignTraitDefs(traitDef, localTraits, undefined)
        }
    } else {
        throw new TypeError(`dataDecl must be a data declaration or a variant declaration`)
    }

    // determine the arity of the trait by iterating over every function
    // while also enforcing an equal arity for all functions
    const fns = Object.values(localTraits).filter(fn => typeof fn === 'function')
    const arity = fns.reduce((max, fn) => {
        assert(fn.length === max,
            `Invalid Trait declaration. All functions must have the same arity`);
        return Math.max(max, fn.length)
    }, fns[0]?.length ?? 0)

    Object.defineProperty(localTraits, 'length', { value: arity })

    return new Proxy(partial(localTraits), {
        get(target, prop) { return Reflect.get(localTraits, prop) }
    })
}
