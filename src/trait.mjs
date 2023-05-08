import { extend } from "./symbols.mjs"
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { isPrototypeOf } from "./isPrototypeOf.mjs";
import { partial } from './partial.mjs';
import { isDataDecl } from "./data.mjs";
import { defPatternFunc } from "./patterns.mjs";
import { isPrimitive } from "./isPrimitive.mjs";
import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";

export const dataDecl = Symbol('dataDecl'),
    memoFix = Symbol('memoFix');

const primCons = [Number, String, Boolean, BigInt]

function validateCases(data, cases) {
    if (data == undefined && !('_' in cases))
        throw new TypeError("Wildcard '_' must be defined if data is undefined");
    else if (isDataDecl(data)) {
        if (!('_' in cases)) {
            // every key in data must be in traitDef
            for (let name in data)
                if (!cases[name] && !cases[extend]?.prototype[name])
                    throw new TypeError(`Invalid Trait declaration. Missing definition for '${String(name)}'`);
        }
    } else if (primCons.includes(data)) {
        if (data === Boolean && !('_' in cases)) {
            ['true', 'false'].forEach(name => {
                if (!cases[name])
                    throw new TypeError(`Invalid Trait declaration. Missing definition for '${String(name)}'`);
            });
        } else if (!cases['_'] && !cases[extend]?.prototype['_']) {
            throw new TypeError(`Invalid Trait declaration. Missing definition for '${String(data.name)}'`);
        }
    } else {
        throw new TypeError(`Invalid data declaration. Expected data, primitive constructor or undefined`);
    }
}

function protoTrait() { }

export const isTrait = (obj) => isPrototypeOf(obj, protoTrait.prototype)

/**
 * Defines a trait
 * @param {object} dataDef - The data declaration
 * @param {object|Function} traitDecl
 * @returns {object} The trait
 */
export function trait(dataDef, traitDecl) {
    if (!isDataDecl(dataDef) && !primCons.includes(dataDef))
        throw new TypeError(
            'Invalid dataDef declaration.' +
            `${typeof dataDef === 'function' ? ` Did you forget to call with a parameter?` : ''}`
        );

    const cases = typeof traitDecl === 'function' ? traitDecl(dataDef) : traitDecl

    if (!isObjectLiteral(cases))
        throw new TypeError('Trait declaration must be an object literal');

    if (cases[extend] && !(isTrait(cases[extend])))
        throw new TypeError('A Trait can only extend another Trait declaration');

    validateCases(dataDef, cases);

    const visited = new BoxedMultiKeyMap();

    const memoFixHandler = {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver)

            if (typeof value === 'function') {
                const { bottom } = traitDecl[memoFix]
                function fn(...args) {
                    if (!visited.has(...args)) {
                        visited.set(...args, typeof bottom === 'function' ? bottom(...args) : bottom);
                        visited.set(...args, value.apply(this, args));
                    }
                    return visited.get(...args);
                }
                Object.defineProperty(fn, 'length', { value: value.length })
                return fn
            }
        }
    }

    function subTrait(context, ...args) {
        let vName,
            isPrim = isPrimitive(context)
        if (isPrim)
            vName = typeof context == 'bigint' ? `${context}n` : String(context)
        else
            vName = context.constructor.name

        const proto = subTrait.prototype,
            strategy = proto[vName] ?? proto['_']

        if (!strategy)
            throw new TypeError(`Trait cannot be applied. No variant for ${vName} found`)

        return strategy.call(
            this ?? (isPrim ? proto : context),
            context,
            ...args
        )
    }
    const proto = Object.create(cases[extend]?.prototype ?? protoTrait.prototype)
    if (cases[memoFix] && !('bottom' in cases[memoFix]))
        throw new TypeError("Invalid Trait declaration. Missing 'bottom' property in memoFix");

    subTrait.prototype = cases[memoFix] ? new Proxy(proto, memoFixHandler) : proto
    subTrait[dataDecl] = dataDef

    const entries = Object.entries(cases),
        patternOrFunc = entries[0]?.[1],
        arity = typeof patternOrFunc === 'function' ? patternOrFunc.length :
            Array.isArray(patternOrFunc) ? patternOrFunc[0].length - 1 :
                (cases[extend]?.length ?? NaN)

    Object.assign(subTrait.prototype,
        entries.reduce((acc, [vName, fnOrPattern]) => {
            if (typeof fnOrPattern !== 'function' && !Array.isArray(fnOrPattern))
                throw new TypeError(`Invalid Trait declaration. Expected function or pattern array for '${String(vName)}'`);
            const fn = acc[vName] = defPatternFunc(vName, fnOrPattern);
            if (fn.length !== arity)
                throw new TypeError(`Invalid Trait declaration. All functions must have the same arity`);
            acc[vName] = fn
            return acc
        }, Object.create(null))
    )

    Object.defineProperty(subTrait, 'length', { value: arity })

    return new Proxy(partial(subTrait), {
        get(target, prop, receiver) {
            return Reflect.get(subTrait, prop, receiver)
        },
        getPrototypeOf() {
            return subTrait.prototype
        }
    })
}