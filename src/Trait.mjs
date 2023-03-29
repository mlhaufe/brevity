import { isObjectLiteral } from './isObjectLiteral.mjs';
import { assert } from './assert.mjs';
import { extend, variant, variantName, isData } from './index.mjs';

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
    let fn
    const dataType = this[data]

    if (dataType == undefined) {
        fn = this['_']
    } else if (dataType[isData]) {
        if (typeof instance === 'object' && instance !== null && variant in instance)
            fn = this[instance[variantName]]
        else
            throw new TypeError(`instance must be a data variant: ${String(instance)}`)
    } else if (dataType.prototype[variant]) { // anonymous data declaration
        if (typeof instance === 'object' && instance !== null && variant in instance) {
            const vt = instance[variant],
                fns = getAncestorFunctions(this);
            // have to lookup by associated variant instead of by name
            // pattern matching may solve this in the future
            fn = fns.find(fn => fn[variant] === vt)
        } else {
            throw new TypeError(`instance must be a data variant: ${String(instance)}`)
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

    throw new TypeError(`no trait defined for ${String(instance)}`)
}

const primitiveList = [Number, String, Boolean, BigInt],
    msgWildcardInvalid = `Invalid Trait declaration. Wildcard '_' must be a function`;

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

    if ("_" in traitDef) {
        assert(typeof traitDef['_'] === 'function', msgWildcardInvalid);
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
        } else {
            assert(typeof traitDef['_'] === 'function', msgWildcardInvalid);
            localTraits['_'] = traitDef['_'];
        }

        // but we iterate over traitDef instead of dataDecl so we can associate the variant
        // since it could have override entries
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
    } else if (primitiveList.includes(dataDecl)) {
        if (!('_' in traitDef)) {
            if (dataDecl === Boolean) {
                const message = `Invalid Trait declaration. Missing definition for`;
                for (const [name, f] of Object.entries(traitDef)) {
                    assert(typeof f === 'function', `${message} '${name}'`);
                    localTraits[name] = f;
                    f[variant] = undefined;
                }
            } else {
                throw new TypeError(msgWildcardInvalid);
            }
        } else {
            for (const [name, f] of Object.entries(traitDef)) {
                assert(typeof f === 'function', `Invalid Trait declaration. '${name}' must be a function`);
                localTraits[name] = f;
                f[variant] = undefined;
            }
        }
    } else {
        throw new TypeError(`dataDecl must be a data declaration or a variant declaration`)
    }

    return localTraits
}