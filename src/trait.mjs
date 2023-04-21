import { Data } from './data.mjs';
import { Complected } from './complect.mjs';
import { isObjectLiteral } from './isObjectLiteral.mjs';
import { apply, extend } from './symbols.mjs';

export const _ = Symbol('_'),
    dataDecl = Symbol('dataDecl')

const primCons = [Number, String, Boolean, BigInt],
    typeofList = ['boolean', 'bigint', 'number', 'string', 'symbol', 'undefined']

const isPrimitive = (p) => {
    return p === null || typeofList.includes(typeof p)
}

const satisfiesPrimitive = (Cons, value) => {
    const typeString = Cons.name.toLowerCase();
    return (typeof value === typeString || value instanceof Cons)
}

const traitHandler = {
    get(target, prop, receiver) {
        if (prop === 'length')
            return target.constructor.length

        return Reflect.get(target, prop, receiver)
    },
    apply(target, thisArg, argumentsList) {
        if (thisArg instanceof Complected) {
            return Reflect.apply(target[apply], thisArg, [thisArg, ...argumentsList])
        }

        return Reflect.apply(
            target[apply],
            thisArg ?? target.constructor.prototype,
            argumentsList
        )
    }
}

export class Trait extends Function {
    constructor() {
        super()
        return new Proxy(this, traitHandler)
    }

    [apply](instance, ...args) {
        const expected = this.constructor[dataDecl]

        if (expected) {
            if (isPrimitive(instance)) {
                if (!satisfiesPrimitive(expected, instance))
                    throw new TypeError(`Trait cannot be applied. Expected ${expected.name} but got ${String(instance)}`)
            } else if (!(instance instanceof expected))
                throw new TypeError(`Trait cannot be applied. Expected ${expected.name} but got ${instance.constructor.name}`)
        }

        let vName
        if (isPrimitive(instance))
            vName = typeof instance == 'bigint' ? `${instance}n` : String(instance)
        else
            vName = instance.constructor.name

        const f = this[vName],
            fWild = this['_']

        if (!f && !fWild)
            throw new TypeError(`Trait cannot be applied. No variant for ${vName} found`)

        return (f ?? fWild)(instance, ...args)
    }
}

/**
 * Defines a trait
 * @param {object} data
 * @param {object|((family: object) => object)} traitCfg
 * @returns {object} The trait
 */
export const trait = (data, traitCfg) => {
    if (!isObjectLiteral(traitCfg))
        throw new TypeError('Trait declaration must be an object literal');
    const traitDef = Object.assign(Object.create(traitCfg[extend] ?? null), traitCfg)

    validateDefs(data, traitDef);

    if (traitDef[extend] && !(traitDef[extend] instanceof Trait))
        throw new TypeError('A Trait can only extend another Trait declaration');

    class SubTrait extends (traitDef[extend]?.constructor ?? Trait) {
        static [dataDecl] = data

        static {
            const entries = Object.entries(traitDef),
                arity = entries[0]?.[1]?.length ?? 0

            for (const [name, f] of entries) {
                if (f.length !== arity)
                    throw new TypeError(`Invalid Trait declaration. All functions must have the same arity`);
                this.prototype[name] = f;
                Object.defineProperty(f, 'name', { value: name })
            }

            Object.defineProperty(this, 'length', { value: arity })
        }
    }

    /*
        if (typeof traitDef === 'function') {
            // Create just enough of an object so that it isTrait returns true
            // The complect function utilze this to initialize properly
            return Object.assign(Object.create(protoTrait), {
                init: (family) => trait(data, traitDef(family))
            })
        }
    */

    return new SubTrait()
}

function validateDefs(data, traitDef) {
    if (data == undefined && !('_' in traitDef))
        throw new TypeError("Wildcard '_' must be defined if data is undefined");
    else if (data instanceof Data) {
        if (!('_' in traitDef)) {
            // every key in data must be in traitDef
            for (let name in data)
                if (!traitDef[name])
                    throw new TypeError(`Invalid Trait declaration. Missing definition for '${String(name)}'`);
        }
    } else if (primCons.includes(data)) {
        if (data === Boolean && !('_' in traitDef)) {
            ['true', 'false'].forEach(name => {
                if (!traitDef[name])
                    throw new TypeError(`Invalid Trait declaration. Missing definition for '${String(name)}'`);
            });
        } else if (!('_' in traitDef)) {
            throw new TypeError(`Invalid Trait declaration. Missing definition for '${String(data.name)}'`);
        }
    } else {
        throw new TypeError(`Invalid data declaration. Expected data, primitive constructor or undefined`);
    }
}

/*
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

*/

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

/*
// const isPattern = (p) => {
//     return isPrimitive(p) || variant in p || isObjectLiteral(p) || Array.isArray(p)
// }

protoTrait[apply] = function self(instance, ...args) {
    let fn
    const dataType = this[dataDecl]

    if (dataType == undefined) {
        fn = this['_']
    } else if (dataType[isData]) {
        if (typeof instance === 'object' && instance !== null && variant in instance)
            fn = this[instance[variantName]]
        else
            throw new TypeError(`instance must be a data variant: ${instance[variantName]}`)
    } else if (primCons.includes(dataType)) {
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
    // @ts-ignore
    if ('_' in this) return this['_'].call(this, instance, ...args);

    throw new TypeError(`no trait defined for ${instance[variantName]}`)
}

const msgWildcardInvalid = `Invalid Trait declaration. Wildcard '_' must be a function`;

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
 * /
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

export function trait(dataDec, traitDef) {
      if ("_" in traitDef)
        localTraits['_'] = createTraitFn('_', traitDef['_'])



    return new Proxy(partial(localTraits), {
        get(target, prop) { return Reflect.get(localTraits, prop) }
    })
}
*/