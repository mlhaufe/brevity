import { defVariants } from "./defVariants.mjs"
import { assert } from "./predicates/assert.mjs"
import { implies } from "./predicates/implies.mjs"

export const dataDecl = Symbol('dataDecl'),
    declNames = Symbol('declNames')

export class AlgDataType {
    static [dataDecl] = Object.create(null)
    static [declNames] = []

    //static getTransformer(conf) { return conf.getAtomXF(this) ?? id }

    constructor(typeParams = Object.create(null)) {
        assert(
            implies(typeParams != undefined, !('self' in (typeParams ?? {}))),
            `'self' is implicit and should not be passed as an argument`
        )

        const paramNames = Object.keys(typeParams).sort(),
            dNames = this.constructor[declNames]

        assert(
            dNames.length == paramNames.length,
            `Declaration mismatch. The provided argument names must match the declaration. ` +
            `Expected: {${dNames}}, provided: {${paramNames}}`
        )

        assert(
            dNames.every((dName, i) => dName === paramNames[i]),
            `Declaration mismatch. The provided argument names must match the declaration. ` +
            `Expected: {${dNames}}, provided: {${paramNames}}`
        )

        if (dNames.length > 0)
            defVariants(this.constructor[dataDecl], this.constructor)
        // TODO: need to return type specific variants
    }

    // getTransformer for instantiated parameterized types.
    // getTransformer(conf) {
    //     return AlgDataType.getTransformer({
    //         name: conf.name,
    //         unfoldCtors: conf.unfoldCtors,
    //         // The type parameter now has a value, so call it's getTransformer instead of using conf.getParamXF.
    //         getParamXF: (name) => this.#typeParams[name].getTransformer(conf),
    //         getCtorXF: conf.getCtorXF,
    //         getAtomXF: conf.getAtomXF
    //     })
    // }
}
