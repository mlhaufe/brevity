import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import {
    isCamelCase, isCapitalized, isConstructor, isObjectLiteral,
    isPrimitive, satisfiesPrimitive
} from "./predicates.mjs";
import { Complected } from "./complect.mjs";
import { _, dataDecl, dataVariant } from "./symbols.mjs";
import { normalizeArgs } from "./normalizeArgs.mjs";
import { callable } from "./callable.mjs";

export const BaseVariant = Symbol('BaseVariant')

export class Data {
    static [BaseVariant] = class {
        *[Symbol.iterator]() { for (let k in this) yield this[k] }
    }
}

const TypeRecursion = callable(class {
    constructor(...args) {
        this.args = args
    }
})

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
 * @param {*} Factory
 * @param {any[]} args
 * @param {Record<string, object | Function>} props
 */
function guardCheck(Factory, args, props) {
    Object.entries(props).forEach(([prop, guard], i) => {
        const value = args[i],
            errMsg = (expected, actual) =>
                `Guard mismatch on property '${prop}'. Expected: ${expected}, got: ${actual}`

        if (value === _) {
            return
        } else if (isObjectLiteral(guard) && Object.keys(guard).length === 0) {
            // TODO: { guard: {}, get(){} }
            return
        } else if (isConstructor(guard)) {
            if (guard === TypeRecursion) { // singleton types
                const isVariant = value instanceof Data[BaseVariant],
                    isComplected = value instanceof Complected
                if (!isVariant && !isComplected)
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
                if (isVariant && !(value instanceof Factory[BaseVariant]))
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
                if (isComplected && !(value[dataVariant] instanceof Factory[BaseVariant]))
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
            } else if (guard instanceof TypeRecursion) { // parameterized types
                if (!(value instanceof Factory[BaseVariant]))
                    throw new TypeError(errMsg('TypeRecursion', JSON.stringify(value)))
                // TODO: utilize args
            } else if (isPrimitive(value)) {
                if (!satisfiesPrimitive(value, guard))
                    throw new TypeError(errMsg(guard.name, JSON.stringify(value)))
            } else if (guard.prototype instanceof Data) {
                if (!(value instanceof guard[BaseVariant]))
                    throw new TypeError(errMsg(guard.name, JSON.stringify(value)))
            } else if (!(value instanceof guard)) {
                throw new TypeError(errMsg(guard, JSON.stringify(value)))
            }
        } else if (typeof value === 'object') {
            if (typeof guard === 'function' && !(value instanceof guard))
                throw new TypeError(errMsg(guard.name, JSON.stringify(value)))

            if (guard instanceof Data && !(value instanceof Factory))
                throw new TypeError(errMsg(guard, JSON.stringify(value)))
        }
    })
}
const isValidGuard = (guard) =>
    isConstructor(guard) ||
    isObjectLiteral(guard) && Object.keys(guard).length === 0

/**
 * Defines a data type
 * @overload
 * @param {import("./symbols.mjs").Constructor<Data>} BaseData The base data type
 * @param dataDecl The variants definition
 * @returns The data type
 *
 * @overload
 * @param dataDecl The variants definition
 * @returns The data type
 */
export function data(BaseData, dataDec) {
    if (arguments.length === 1) {
        dataDec = BaseData
        BaseData = Data
    }

    if (BaseData instanceof Complected)
        BaseData = BaseData[dataDecl]
    else if (BaseData.prototype instanceof Complected)
        BaseData = BaseData.prototype[dataDecl]

    // TODO: can the function form be moved into the Factory constructor?
    let dataDef
    if (typeof dataDec === 'function') {
        if (dataDec.length > 1) {
            const dataCons = (...typeParams) => {
                return data(dataDec(TypeRecursion, ...typeParams))
            }
            Object.defineProperty(dataCons, 'length', { value: dataDec.length - 1 })
            return dataCons
        } else {
            dataDef = dataDec(TypeRecursion)
        }
    } else {
        dataDef = dataDec
    }

    if (!isObjectLiteral(dataDef))
        throw new TypeError('Invalid data declaration. Object literal expected')
    if (isConstructor(BaseData) && !(BaseData.prototype instanceof Data) && BaseData !== Data)
        throw new TypeError('Invalid Base reference. A Data declaration was expected')

    const Factory = callable(class extends BaseData {
        static [BaseVariant] = class extends BaseData[BaseVariant] { }

        static {
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
                    memo = new BoxedMultiKeyMap(),
                    Self = this

                const Variant = callable(class extends this[BaseVariant] {
                    static {
                        Object.defineProperties(this, {
                            name: { value: vName },
                            length: { value: propNames.length }
                        })
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
                                    Object.defineProperty(this.prototype, propName, {
                                        get() {
                                            if (_result) return _result
                                            _result = prop.get.apply(this)
                                            guardCheck(Self, [_result], { [propName]: prop.guard })
                                            return _result
                                        },
                                        enumerable: true
                                    })
                                }
                            }
                        }
                    }
                    constructor(...args) {
                        super()
                        const normalizedArgs = normalizeArgs(propNames, args, vName),
                            cached = memo.get(...normalizedArgs);
                        if (cached)
                            return cached;
                        guardCheck(Self, normalizedArgs, props)
                        assignProps(this, propNames, normalizedArgs)
                        Object.freeze(this)
                        memo.set(...[...normalizedArgs, this])
                    }
                })

                this[vName] = propNames.length === 0 ? Variant() : Variant
            }
        }
    })

    return Object.freeze(Factory)
}