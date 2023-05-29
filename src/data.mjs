import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import {
    isCamelCase, isCapitalized, isConstructor, isObjectLiteral,
    isPrimitive, satisfiesPrimitive
} from "./predicates.mjs";
import { _, dataDecl, dataVariant } from "./symbols.mjs";
import { normalizeArgs } from "./normalizeArgs.mjs";
import { callable } from "./callable.mjs";

export const BaseVariant = Symbol('BaseVariant')

const typeArgs = Symbol('typeArgs'),
    init = Symbol('init')

export class Data {
    static [BaseVariant] = class IterableVariant {
        *[Symbol.iterator]() {
            for (let k in this) {
                const v = this[k]
                if (typeof v !== 'function')
                    yield this[k]
            }
        }
    }
}

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
            if (guard === Data) { // singleton types
                const isVariant = value instanceof Data[BaseVariant],
                    isComplected = value[dataDecl]
                if (!isVariant && !isComplected)
                    throw new TypeError(errMsg('Data', JSON.stringify(value)))
                if (isVariant && !(value instanceof Factory[BaseVariant]))
                    throw new TypeError(errMsg('Data', JSON.stringify(value)))
                if (isComplected && !(value[dataVariant] instanceof Factory[BaseVariant]))
                    throw new TypeError(errMsg('Data', JSON.stringify(value)))
            } else if (guard instanceof Data) { // parameterized types
                if (!(value instanceof Factory[BaseVariant]))
                    throw new TypeError(errMsg('Data', JSON.stringify(value)))
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

            if (guard instanceof Data && !(value instanceof Factory[BaseVariant]))
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

    if (BaseData[dataDecl])
        BaseData = BaseData[dataDecl]

    if (isConstructor(BaseData) && !(BaseData.prototype instanceof Data) && BaseData !== Data)
        throw new TypeError('Invalid Base reference. A Data declaration was expected')

    const memo = new BoxedMultiKeyMap();
    const Factory = callable(class Factory extends BaseData {
        static [BaseVariant] = class VariantBase extends BaseData[BaseVariant] { };

        [init](dataDef) {
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
                    Self = this.constructor

                const Variant = callable(class extends Self[BaseVariant] {
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
                        const normalizedArgs = normalizeArgs(propNames, args, vName)
                        if (memo.has(this.constructor, ...normalizedArgs))
                            return memo.get(this.constructor, ...normalizedArgs);
                        guardCheck(Self, normalizedArgs, props)
                        assignProps(this, propNames, normalizedArgs)
                        Object.freeze(this)
                        memo.set(this.constructor, ...normalizedArgs, this)
                    }
                })

                this[vName] = propNames.length === 0 ? Variant() : Variant
            }
        }

        [typeArgs] = []

        constructor(...args) {
            super(...args)
            if (memo.has(this.constructor, ...args))
                return memo.get(this.constructor, ...args)
            memo.set(this.constructor, ...args, this)
            this[typeArgs] = args
            if (isObjectLiteral(dataDec))
                this[init](dataDec)
            else if (typeof dataDec === 'function')
                this[init](dataDec(...args))
            else
                throw new TypeError('Invalid data declaration. Expected an object literal or a function')
        }
    })

    return Object.freeze(Factory)
}