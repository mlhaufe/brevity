import { isObjectLiteral } from './isObjectLiteral.mjs';
import { assert } from './assert.mjs';
import { implies } from './implies.mjs';
import { extend, variant, isData } from './index.mjs';

export const isTrait = Symbol('isTrait'),
    data = Symbol('data'),
    apply = Symbol('apply');

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

const protoTrait = () => { }
protoTrait[isTrait] = true;
protoTrait[apply] = function self(instance, ...args) {
    if (typeof instance === 'object' && instance !== null && variant in instance) {
        const vt = instance[variant],
            fns = getAncestorFunctions(this),
            // have to lookup by associated variant instead of by name
            // because a trait can be defined for an anonymous data declaration
            fn = fns.find(fn => fn[variant] === vt)

        if (fn) return fn.call(this, instance, ...args);

        // fallback to wildcard
        if ('_' in this) return this['_'].call(this, instance, ...args);

        throw new TypeError(`no trait defined for ${String(vt)}`)
    } else if (this[data] == undefined) {
        return this['_'].call(this, instance, ...args);
    } else {
        throw new TypeError(`instance must be a variant: ${String(instance)}`)
    }
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

    assert(implies(dataDecl == undefined, '_' in traitDef || apply in traitDef),
        "Wildcard '_' or Symbol(apply) must be defined if dataDecl is undefined");

    if ("_" in traitDef) {
        assert(typeof traitDef['_'] === 'function', `Wildcard '_' must be a function`);
        localTraits['_'] = traitDef['_'];
    }

    if (apply in traitDef) {
        assert(typeof traitDef[apply] === 'function', `Symbol(apply) trait must be a function`);
        localTraits[apply] = traitDef[apply];
    }

    Reflect.setPrototypeOf(localTraits,
        extend in traitDef ? traitDef[extend] : protoTrait
    )

    localTraits[data] = dataDecl

    if (dataDecl == undefined) return localTraits

    if (isData in dataDecl) {
        if (!('_' in traitDef)) {
            // every key in dataDecl must be in traitDef
            Object.keys(dataDecl).forEach(name => {
                assert(traitDef[name] != null, `Invalid Trait declaration. Missing definition for '${String(name)}'`);
            })
        } else {
            assert(typeof traitDef['_'] === 'function', `Invalid Trait declaration. Wildcard '_' must be a function`);
            localTraits['_'] = traitDef['_'];
        }

        // but we iterate over traitDef instead of dataDecl so we can associate the variant
        // since the it could have override entries
        for (const [name, f] of Object.entries(traitDef)) {
            assert(typeof f === 'function', `Invalid Trait declaration. '${name}' must be a function`);
            localTraits[name] = f;
            f[variant] = dataDecl[name];
        }
    } else if (variant in dataDecl.prototype) {
        // traitDef may only have one function. that is f
        assert(Object.keys(traitDef).length === 1, `Only one trait may be defined for a variant declaration`);
        const [name, f] = Object.entries(traitDef)[0];
        assert(typeof f === 'function', `trait must be a function: ${name}`);
        localTraits[name] = f;
        f[variant] = dataDecl;
    } else {
        throw new TypeError(`dataDecl must be a data declaration or a variant declaration`)
    }

    return localTraits
}