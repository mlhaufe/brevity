import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import {
    isCamelCase, isCapitalized, isConstructor, isObjectLiteral,
    isPrimitive, isPrototypeOf, satisfiesPrimitive
} from "./predicates.mjs";
import { isComplectedVariant } from "./complect.mjs";
import { dataVariant, extend } from "./symbols.mjs";
import { normalizeArgs } from "./normalizeArgs.mjs";

const baseVariant = Symbol('baseVariant')

export const protoData = Object.assign(Object.create(null), {
    *[Symbol.iterator]() {
        for (let k in this)
            yield this[k]
    }
})

export const protoFactory = Object.create(null),
    isDataDecl = (obj) => isPrototypeOf(obj, protoFactory),
    isDataVariant = (obj) => isPrototypeOf(obj, protoData)

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

const isValidGuard = (guard) =>
    isConstructor(guard) ||
    isObjectLiteral(guard) && Object.keys(guard).length === 0 ||
    isDataDecl(guard)

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
            // TODO: { guard: {}, get(){} }
            return
            // TODO: if wildcard: return
        } else if (isConstructor(guard)) {
            if (guard === TypeRecursion) { // singleton types
                const isData = isDataVariant(value),
                    isComplected = isComplectedVariant(value)
                if (!isData && !isComplected)
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
                if (isData && !isPrototypeOf(value, factory[baseVariant]))
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
                if (isComplected && !isPrototypeOf(value[dataVariant], factory[baseVariant]))
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
        // TODO: dataDecl subtype checking and alternative method for
        // associating baseVariant with factory
        factory = dataDef[extend] ? Object.create(dataDef[extend]) :
            Object.assign(Object.create(protoFactory), { [baseVariant]: protoVariant })

    for (let [vName, props] of Object.entries(dataDef)) {
        if (!isCapitalized(vName))
            throw new TypeError(`variant name must be capitalized: ${vName}`);
        if (!isObjectLiteral(props))
            throw new TypeError(`Invalid variant '${vName}'. Object literal expected`)

        const propNames = Object.keys(props).filter(propName => {
            const guard = props[propName]
            if (isObjectLiteral(guard) && typeof guard.get === 'function')
                return false
            return true
        }),
            memo = new BoxedMultiKeyMap()

        function Variant(...args) {
            if (new.target !== Variant)
                // @ts-ignore: function as constructor
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
        for (let [propName, prop] of Object.entries(props)) {
            if (!isCamelCase(propName))
                throw new TypeError(`variant properties must be camelCase strings: ${vName}: ${props}`);
            if (isObjectLiteral(prop)) {
                if (isValidGuard(prop))
                    continue
                if (prop.guard && !isValidGuard(prop.guard))
                    throw new TypeError(`Invalid guard property on variant '${vName}'. Expected a constructor, empty object literal, or data declaration`)
                if (prop.guard && !prop.get)
                    throw new TypeError(`Invalid get property on variant '${vName}'. Expected a function`)
                if (typeof prop.get === 'function') {
                    let _result
                    const getter = function () {
                        if (_result)
                            return _result
                        _result = prop.get.apply(this)
                        guardCheck(factory, [_result], { [propName]: prop.guard })
                        return _result
                    }

                    Object.defineProperty(Variant.prototype, propName, {
                        get: getter,
                        enumerable: true
                    })
                }
            }
        }

        Object.defineProperties(Variant, {
            name: { value: vName },
            length: { value: propNames.length }
        })
        factory[vName] = propNames.length === 0 ? Variant() : Variant
    }

    return Object.freeze(factory)
}