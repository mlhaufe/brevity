import { AlgDataType } from "./AlgDataType.mjs"
import { callable } from "./callable.mjs"
import { assert } from "./predicates/assert.mjs"
import { isConstructor } from "./predicates/isConstructor.mjs"
import { isPlainObject } from "./predicates/isPlainObject.mjs"
import { TypeRecursion } from "./TypeRecursion.mjs"

const reUppercase = /^\p{Uppercase_Letter}/u,
    reLowercase = /^\p{Lowercase_Letter}/u

export function defVariants(def, DataCons) {
    Object.entries(def).forEach(([varName, varBody]) => {
        assert(reUppercase.test(varName), `Invalid variant format: ${varName}. Variant names must be capitalized`)

        assert(isPlainObject(varBody), 'Invalid variant definition. Object literal expected')

        const varProps = Object.entries(varBody)

        // empty objects are singletons
        if (varProps.length === 0) {
            DataCons[varName] = Object.seal(new DataCons())
        } else {
            // objects with properties become constructors
            const Variant = DataCons[varName] = callable(class Variant extends DataCons {
                constructor(args) {
                    super()
                    const argEntries = Object.entries(args),
                        errExpected = `${varName}({${Object.keys(varBody)}})`,
                        errProvided = `${varName}({${Object.keys(args)}})`
                    assert(
                        argEntries.length == varProps.length,
                        `Argument mismatch. Expected: ${errExpected}, provided: ${errProvided}`
                    )
                    argEntries.forEach(([argName, argValue]) => {
                        assert(
                            argName in varBody,
                            `Unexpected argument '${argName}'. Expected: ${errExpected}, provided: ${errProvided}`
                        )
                        this[argName] = argValue
                    })
                    Object.assign(this, args)
                    Object.seal(this)
                }
            })

            varProps.forEach(([key, expected]) => {
                assert(
                    reLowercase.test(key),
                    `Invalid property format: ${key}. Property names must start with a lowercase letter`
                )
                assert(expected !== Function, `'Function' is not an allowed property value`)

                let _priv = undefined
                Object.defineProperty(Variant.prototype, key, {
                    get() { return _priv },
                    set(newValue) {
                        if (expected instanceof AlgDataType) {
                            // TODO: better error 
                            assert(newValue instanceof expected, `Type mismatch`)
                        } else if (isConstructor(expected)) {
                            // TODO: better error
                            assert(newValue instanceof expected, `Type mismatch`)
                        } else if (typeof expected == 'function') {
                            // TODO: better error
                            assert(expected(newValue), `Type mismatch.`)
                        } else if (expected instanceof TypeRecursion) {
                            assert(newValue instanceof DataCons, 'Type mismatch')
                        } else {
                            throw new Error("Not implemented")
                        }

                        _priv = newValue
                    }
                })
            })

            Object.freeze(Variant)
            Object.freeze(Variant.prototype)
        }
    })
}