import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";

const protoComplected = Object.create(null)

export function complect(dataDef, traitCfg) {
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
            memo.set(dataInstance, this)
        }
        ConsComplected.prototype = Object.defineProperties(Object.create(protoComplected), {
            constructor: { value: ConsComplected, enumerable: false },
            [Symbol.iterator]: {
                enumerable: false,
                value: function* () { for (let k in this) yield this[k] }
            },
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

    return complected
}

/*
import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { callable } from "./callable.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";
import { dataDecl, trait } from "./trait.mjs";

export class Complected {
    *[Symbol.iterator]() {
        for (const key in this) {
            const value = this[key];
            if (typeof value !== 'function')
                yield this[key];
        }
    }
}

/**
 * Combines a data declaration with traits
 * @param {object} dataRef - The data declaration
 * @param {Record<PropertyKey,object>} traits - The trait configuration
 * @returns {object} - The complected data type
 * /
export const complect = (dataRef, traits) => {
    if (!(dataRef instanceof Data))
        throw new TypeError('Data declaration must be a Data object')
    if (!isObjectLiteral(traits))
        throw new TypeError('Traits must be an object literal')

    class ComplectedFactory extends Complected {
        static {
            for (let consName in dataRef) {
                const Cons = dataRef[consName],
                    pool = new BoxedMultiKeyMap();

                const ComplectedVariant = callable(class extends ComplectedFactory {
                    static {
                        for (let traitName in traits) {
                            let traitRef = traits[traitName]

                            if (traitRef[fnTraitCfg]) {
                                traitRef = trait(dataRef, traitRef[fnTraitCfg](this))
                            }

                            if (traitRef.name === '_partial') {
                                this.prototype[traitName] = function (...args) {
                                    return traitRef(this, ...args)
                                }
                            } else {
                                this.prototype[traitName] = function (...args) {
                                    return traitRef[consName].call(this, this, ...args)
                                }
                            }
                        }

                        Object.defineProperty(this, 'name', { value: consName });
                    }
                    constructor(...args) {
                        super()
                        const vt = typeof Cons === 'function' ? new Cons(...args) : Cons

                        const cached = pool.get(vt);
                        if (cached) return cached;

                        const result = Object.assign(this, vt)
                        pool.set(vt, result)

                        return result
                    }
                })

                this.prototype[consName] = typeof Cons === 'function' ? ComplectedVariant : ComplectedVariant()
            }
        }
    }

    return new ComplectedFactory()
} */