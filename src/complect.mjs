import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { apply, Trait } from "./trait.mjs";
import { dataDecl, dataVariant, traitDecls } from "./symbols.mjs";
import { Data } from "./data.mjs";
import { callable } from "./callable.mjs";
import { isConstructor } from "./predicates.mjs";
import { normalizeArgs } from "./normalizeArgs.mjs";

/**
 * @template T
 * @typedef {import("./symbols.mjs").Constructor<T>} Constructor
 */

/**
 * Complects a data declaration with traits
 * @param {Constructor<Data>} DataCons
 * @param {(Constructor<Trait>)[]} Traits
 * @returns {*}
 */
export function complect(DataCons, Traits = []) {
    if (!isConstructor(DataCons) && DataCons.prototype instanceof Data)
        throw new TypeError('Invalid dataDef. A Data declaration was expected');
    if (!Array.isArray(Traits) || !Traits.every(T => isConstructor(T) && T.prototype instanceof Trait))
        throw new TypeError('Array of traits expected');

    const memo = new BoxedMultiKeyMap();
    return Object.freeze(callable(class _Complected extends DataCons {
        get [dataDecl]() { return DataCons }
        get [traitDecls]() { return Traits };

        constructor(...args) {
            super(...args)
            if (memo.has(this.constructor, ...args))
                return memo.get(this.constructor, ...args)
            memo.set(this.constructor, ...args, this)
            const family = this
            const _traitProxyHandler = {
                get(target, prop) {
                    // search Traits for the matching method name
                    for (let TraitCons of Traits) {
                        const methodName = TraitCons.name
                        if (prop === methodName) {
                            const trait = new TraitCons(family)
                            function method(...args) { return trait[apply](this, ...args) }
                            Object.defineProperty(method, 'name', { value: methodName })
                            return method
                        }
                    }
                    return Reflect.get(target, prop)
                }
            }

            for (let consName in family) {
                const Cons = family[consName],
                    VariantCons = /** @type {Constructor<Data>} */ (typeof Cons === 'function' ? Cons : Cons.constructor)
                const ConsComplected = callable(class extends VariantCons {
                    static {
                        Object.defineProperties(this, {
                            name: { value: consName },
                            length: { value: VariantCons.length }
                        })
                    }

                    constructor(...args) {
                        super(...args)
                        const propNames = Object.keys(this),
                            vName = this.constructor.name,
                            // TODO: associate with super[normalizedArgs] for caching?
                            normalizedArgs = normalizeArgs(propNames, args, vName),
                            cached = memo.get(this.constructor, ...normalizedArgs)
                        if (cached)
                            return cached;
                        const proxy = new Proxy(this, _traitProxyHandler)
                        memo.set(this.constructor, ...normalizedArgs, proxy)
                        return proxy
                    }

                    get [dataVariant]() { return VariantCons }
                })

                family[consName] = ConsComplected.length === 0 ? ConsComplected() : ConsComplected
            }
            //Object.freeze(family)
        };
    }))
}