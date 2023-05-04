import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isDataDecl } from "./data.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { isPrototypeOf } from "./isPrototypeOf.mjs";

export const protoComplected = Object.assign(Object.create(null), {
    *[Symbol.iterator]() { for (let k in this) yield this[k] }
})

export const isComplectedVariant = (obj) => isPrototypeOf(obj, protoComplected)

export function complect(dataDef, traitCfg) {
    if (!isDataDecl(dataDef))
        throw new TypeError(
            'Invalid dataDef declaration.' +
            `${typeof dataDef === 'function' ? ` Did you forget to call with a parameter?` : ''}`
        );
    if (!isObjectLiteral(traitCfg))
        throw new TypeError('Invalid traitCfg declaration');
    const complected = Object.create(protoComplected)

    for (let consName in dataDef) {
        const DataCons = dataDef[consName]

        const memo = new BoxedMultiKeyMap()
        function ConsComplected(...args) {
            if (!new.target)
                return new ConsComplected(...args);
            const dataInstance = typeof DataCons === 'function' ? DataCons(...args) : DataCons,
                cached = memo.get(dataInstance);
            if (cached)
                return cached;
            Object.assign(this, dataInstance)
            Object.freeze(this)
            memo.set(dataInstance, this)
        }
        ConsComplected.prototype = Object.defineProperties(Object.create(protoComplected), {
            constructor: { value: ConsComplected, enumerable: false },
            ...Object.entries(traitCfg).reduce((acc, [traitName, fn]) => {
                acc[traitName] = {
                    enumerable: false,
                    value(...args) { return fn.call(complected, this, ...args) }
                }
                return acc
            }, Object.create(null))
        })
        Object.defineProperties(ConsComplected, {
            name: { value: consName },
            length: { value: typeof DataCons === 'function' ? DataCons.length : 0 }
        })
        complected[consName] = ConsComplected.length === 0 ? new ConsComplected() : ConsComplected
    }

    return Object.freeze(complected)
}