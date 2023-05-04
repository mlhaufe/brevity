import { extend } from "./symbols.mjs"
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { isPrototypeOf } from "./isPrototypeOf.mjs";
import { partial } from './partial.mjs';
import { isDataDecl } from "./data.mjs";
import { defPatternFunc } from "./patterns.mjs";
import { isPrimitive } from "./isPrimitive.mjs";

export const dataDecl = Symbol('dataDecl')

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
        } else if (!('_' in cases)) {
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

    function subTrait(context, ...args) {
        let vName
        if (isPrimitive(context))
            vName = typeof context == 'bigint' ? `${context}n` : String(context)
        else
            vName = context.constructor.name

        const proto = subTrait.prototype,
            strategy = proto[vName],
            strategyWild = proto['_']

        if (!strategy && !strategyWild)
            throw new TypeError(`Trait cannot be applied. No variant for ${vName} found`)

        return (strategy ?? strategyWild).call(
            this ?? context, context, ...args
        )
    }
    subTrait.prototype = Object.create(cases[extend]?.prototype ?? protoTrait.prototype)
    subTrait[dataDecl] = dataDef

    const entries = Object.entries(cases),
        patternOrFunc = entries[0]?.[1],
        arity = typeof patternOrFunc === 'function' ? patternOrFunc.length :
            Array.isArray(patternOrFunc) ? patternOrFunc[0].length - 1 :
                NaN

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