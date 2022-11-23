/*!
 * @license
 * Copyright (C) 2022 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

import { assert } from "./predicates/assert.mjs"
import { isConstructor } from "./predicates/isConstructor.mjs"

const isData = Symbol('isData')

/**
 * Defines a factory analogous to an Algebraic Data Type
 */
export function Data(variants) {
    function Data() { }
    Data[isData] = true

    Object.entries(variants).forEach(([varName, varBody]) => {
        const varProps = Object.entries(varBody)

        // empty objects are singletons
        if (varProps.length === 0) {
            Data[varName] = Object.seal(Object.create(Data.prototype))
        } else {
            // objects with properties become constructors
            const C = Data[varName] = function (args) {
                if (new.target !== C)
                    return new C(args)

                const argEntries = Object.entries(args),
                    errExpected = `${varName}({${Object.keys(varBody)}})`,
                    errProvided = `${varName}({${Object.keys(args)}})`

                if (argEntries.length != varProps.length) {
                    throw new Error(
                        `Argument mismatch. Expected: ${errExpected}, provided: ${errProvided}`
                    )
                }
                argEntries.forEach(([argName, argValue]) => {
                    if (!(argName in varBody)) {
                        throw new Error(
                            `Unexpected argument '${argName}'. Expected: ${errExpected}, provided: ${errProvided}`
                        )
                    }

                    this[argName] = argValue
                })

                Object.assign(this, args)
                Object.seal(this)
            }
            C.prototype = Object.create(Data.prototype)
            C.prototype.constructor = C

            varProps.forEach(([key, expected]) => {
                let _priv = undefined
                Object.defineProperty(C.prototype, key, {
                    get() { return _priv },
                    set(newValue) {
                        if (expected[isData]) {
                            assert(newValue instanceof expected, `Type mismatch`)
                        } else if (isConstructor(newValue)) {
                            // TODO: better error
                            assert(newValue instanceof expected, `Type mismatch`)
                        } else if (typeof expected == 'function') {
                            // TODO: better error
                            assert(expected(newValue), `Type mismatch.`)
                        } else {
                            throw new Error("Not implemented")
                        }

                        _priv = newValue
                    }
                })
            })

            Object.freeze(C)
            Object.freeze(C.prototype)
        }
    })

    return Object.freeze(Data)
}