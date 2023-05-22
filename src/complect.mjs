import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { apply, Trait } from "./trait.mjs";
import { dataDecl, dataVariant, traitDecls } from "./symbols.mjs";
import { Data } from "./data.mjs";
import { callable } from "./callable.mjs";

export class Complected {
    *[Symbol.iterator]() { for (let k in this) yield this[k] }
}

/**
 * Complects a data declaration with traits
 * @param {*} dataDef
 * @param {*} traits
 * @returns {*}
 */
export function complect(dataDef, traits) {
    if (!(dataDef instanceof Data) && typeof dataDef !== 'function')
        throw new TypeError('Expected a data declaration or a function')
    if (!Array.isArray(traits) || !traits.every(t => t.prototype instanceof Trait))
        throw new TypeError('Array of traits expected');
    if (dataDef.length > 0)
        return (...args) => complect(dataDef(...args), traits)

    class _Complected extends Complected {
        get [dataDecl]() { return dataDef }
        get [traitDecls]() { return traits }

        static {
            const family = this.prototype
            for (let consName in dataDef) {
                const DataCons = dataDef[consName],
                    memo = new BoxedMultiKeyMap()
                const ConsComplected = callable(class extends _Complected {
                    static {
                        Object.defineProperties(this, {
                            name: { value: consName },
                            length: { value: typeof DataCons === 'function' ? DataCons.length : 0 }
                        })
                        const proto = this.prototype
                        for (let TraitCons of traits) {
                            const methodName = TraitCons.name
                            if (proto[methodName])
                                throw new TypeError(`Invalid traitDecl. Duplicate method name: '${methodName}'`);
                            const t = new TraitCons(family)
                            Object.defineProperty(proto, methodName, {
                                enumerable: false,
                                value(...args) { return t[apply](this, ...args) }
                            })
                        }
                    }
                    constructor(...args) {
                        super()
                        const dataInstance = typeof DataCons === 'function' ? DataCons(...args) : DataCons,
                            cached = memo.get(dataInstance);
                        if (cached)
                            return cached;
                        Object.assign(this, dataInstance, { [dataVariant]: dataInstance })
                        Object.freeze(this)
                        memo.set(dataInstance, this)
                    }
                })

                family[consName] = ConsComplected.length === 0 ? ConsComplected() : ConsComplected
            }
            Object.freeze(family)
        }
    }

    return Object.freeze(new _Complected())
}