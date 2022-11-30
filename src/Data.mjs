/*!
 * @license
 * Copyright (C) 2022 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

import { AlgDataType, dataDecl, declNames } from "./AlgDataType.mjs"
import { callable } from "./callable.mjs"
import { defVariants } from "./defVariants.mjs"
import { assert } from "./predicates/assert.mjs"
import { isLambda } from "./predicates/isLambda.mjs"
import { isPlainObject } from "./predicates/isPlainObject.mjs"
import { TypeParam } from "./TypeParam.mjs"
import { TypeRecursion } from "./TypeRecursion.mjs"

function defVariant(DataCons) { }

export function Data(decl) {
    const DataCons = callable(class DataCons extends AlgDataType { })

    if (decl === undefined)
        return Object.freeze(DataCons)

    assert(
        isPlainObject(decl) || isLambda(decl),
        `Invalid variant definition. Object literal or lambda expected: Data(${decl})`
    )

    if (!isLambda(decl)) {
        Object.entries(decl).forEach()


        // defVariants(decl, DataCons)
        return Object.freeze(DataCons)
    } else {
        const names = decl.toString().split('=>')[0].match(/([a-z\d]+)/gi).sort();
        assert(
            names.includes('self'),
            `Invalid lambda definition. Must include a reference to 'self'. Data(${decl})`
        )

        const def = decl({
            self: new TypeRecursion(),
            ...names.filter(name => name != 'self').map(name => ({ name: new TypeParam(name) }))
        })

        assert(
            isPlainObject(def),
            `Invalid lambda definition. An object literal must be returned: Data(${decl})`
        )

        if (names.length == 1) {
            defVariants(def, DataCons)
        }

        DataCons[dataDecl] = def
        DataCons[declNames] = names.filter(name => name != 'self')
        return Object.freeze(DataCons)
    }
}