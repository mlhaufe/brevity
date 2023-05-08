import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isCamelCase } from "./isCamelCase.mjs";
import { isCapitalized } from "./isCapitalized.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { extend } from "./symbols.mjs";
import { isPrototypeOf } from "./isPrototypeOf.mjs";
import { isPrimitive } from "./isPrimitive.mjs";
import { isConstructor } from "./isConstructor.mjs";
import { normalizeArgs } from "./normalizeArgs.mjs";
import { satisfiesPrimitive } from "./satisfiesPrimitive.mjs";

const baseVariant = Symbol('baseVariant')

export const protoData = Object.assign(Object.create(null), {
    *[Symbol.iterator]() {
        for (let k in this)
            yield this[k]
    }
})

export const protoFactory = Object.create(null),
    isDataVariant = (obj) => isPrototypeOf(obj, protoData),
    isDataDecl = (obj) => isPrototypeOf(obj, protoFactory)

function assignProps(obj, propNames, args) {
    Object.defineProperties(obj,
        propNames.reduce((acc, propName, i) => {
            if (typeof args[i] === 'function')
                acc[propName] = { get: args[i], enumerable: true };
            else
                acc[propName] = { value: args[i], enumerable: true };
            return acc;
        }, {})
    )
}

/**
 * @param {object} factory
 * @param {any[]} args
 * @param {Record<string, object | Function>} props
 */
function guardCheck(factory, args, props) {
    Object.entries(props).forEach(([prop, guard], i) => {
        const value = args[i],
            errMsg = (expected, actual) =>
                `Guard mismatch on property '${prop}'. Expected: ${expected}, got: ${actual}`

        if (isObjectLiteral(guard) && Object.keys(guard).length === 0) {
            return
            // TODO: if wildcard: return
        } else if (isConstructor(guard)) {
            if (guard === TypeRecursion) { // singleton types
                if (!isPrototypeOf(value, factory[baseVariant]))
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
            } else if (guard instanceof TypeRecursion) { // parameterized types
                if (!isPrototypeOf(value, factory[baseVariant]))
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
                // TODO: utilize args
            } else if (isPrimitive(value)) {
                if (!satisfiesPrimitive(value, guard))
                    throw new TypeError(errMsg(guard.name, JSON.stringify(value)))
            } else if (!(value instanceof guard)) {
                throw new TypeError(errMsg(guard, JSON.stringify(value)))
            }
        } else if (typeof value === 'object') {
            if (typeof guard === 'function' && !(value instanceof guard))
                throw new TypeError(errMsg(guard.name, JSON.stringify(value)))

            if (isDataDecl(guard) && !isPrototypeOf(value, guard[baseVariant]))
                throw new TypeError(errMsg(guard, JSON.stringify(value)))
        }
    })
}

function TypeRecursion(...args) {
    if (!new.target)
        return new TypeRecursion(...args)
    this.args = args
}

/**
 * Defines a data type
 * @param dataDecl The variants definition
 * @returns The data type
 */
export function data(dataDecl) {
    let dataDef
    if (typeof dataDecl === 'function') {
        if (dataDecl.length > 1) {
            return (...typeParams) => {
                return data(dataDecl(TypeRecursion, ...typeParams))
            }
        } else {
            dataDef = dataDecl(TypeRecursion)
        }
    } else {
        dataDef = dataDecl
    }

    if (!isObjectLiteral(dataDef))
        throw new TypeError('Invalid data declaration. Object literal expected')
    if (dataDef[extend] && !isDataDecl(dataDef[extend]))
        throw new TypeError('Invalid [extend] reference. A data declaration was expected')

    const protoVariant = Object.assign(Object.create(protoData), {
        *[Symbol.iterator]() { for (let k in this) yield this[k] }
    }),
        factory = dataDef[extend] ? Object.create(dataDef[extend]) :
            Object.assign(Object.create(protoFactory), { [baseVariant]: protoVariant })

    for (let [vName, props] of Object.entries(dataDef)) {
        if (!isCapitalized(vName))
            throw new TypeError(`variant name must be capitalized: ${vName}`);
        if (!isObjectLiteral(props))
            throw new TypeError(`Invalid variant '${vName}'. Object literal expected`)

        const propNames = Object.keys(props)
        if (!propNames.every(isCamelCase))
            throw new TypeError(`variant properties must be camelCase strings: ${vName}: ${props}`);

        const memo = new BoxedMultiKeyMap()

        const Variant = function (...args) {
            if (new.target !== Variant)
                return new Variant(...args)
            const normalizedArgs = normalizeArgs(propNames, args, vName),
                cached = memo.get(...normalizedArgs);
            if (cached)
                return cached;
            guardCheck(factory, normalizedArgs, props)
            assignProps(this, propNames, normalizedArgs)
            Object.freeze(this)
            memo.set(...[...normalizedArgs, this])
        }
        Variant.prototype = Object.defineProperty(
            Object.create(protoVariant), 'constructor', { value: Variant, enumerable: false }
        )
        Object.defineProperties(Variant, {
            name: { value: vName },
            length: { value: propNames.length }
        })
        factory[vName] = propNames.length === 0 ? new Variant() : Variant
    }

    return Object.freeze(factory)
}