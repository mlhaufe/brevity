import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { Trait } from "./trait.mjs";
import { isDataDecl } from "./data.mjs";
import { isPrototypeOf } from "./predicates.mjs";
import { apply, dataDecl, dataVariant, traitDecls } from "./symbols.mjs";

export const protoComplected = Object.assign(Object.create(null), {
    *[Symbol.iterator]() { for (let k in this) yield this[k] }
})

/**
 * Checks if an object is a complected declaration
 * @param {*} obj
 * @returns
 */
export const isComplectedVariant = (obj) => isPrototypeOf(obj, protoComplected)

/**
 * Complects a data declaration with traits
 * @param {*} dataDef
 * @param {typeof Trait[]} traits
 */
export function complect(dataDef, traits) {
    if (!isDataDecl(dataDef))
        throw new TypeError(
            'Invalid dataDef declaration.' +
            `${typeof dataDef === 'function' ? ` Did you forget to call with a parameter?` : ''}`
        );
    if (!Array.isArray(traits) || !traits.every(t => t.prototype instanceof Trait))
        throw new TypeError('Array of traits expected');
    const complected = Object.assign(Object.create(protoComplected), {
        [dataDecl]: dataDef,
        [traitDecls]: traits
    })

    for (let consName in dataDef) {
        const DataCons = dataDef[consName],
            memo = new BoxedMultiKeyMap()
        function ConsComplected(...args) {
            if (!new.target)
                // @ts-ignore: function as constructor
                return new ConsComplected(...args);
            const dataInstance = typeof DataCons === 'function' ? DataCons(...args) : DataCons,
                cached = memo.get(dataInstance);
            if (cached)
                return cached;
            Object.assign(this, dataInstance, { [dataVariant]: dataInstance })
            Object.freeze(this)
            memo.set(dataInstance, this)
        }
        ConsComplected.prototype = Object.create(protoComplected)
        Object.defineProperty(ConsComplected.prototype, 'constructor', {
            value: ConsComplected,
            enumerable: false
        })
        Object.defineProperties(ConsComplected, {
            name: { value: consName },
            length: { value: typeof DataCons === 'function' ? DataCons.length : 0 }
        })
        complected[consName] = ConsComplected.length === 0 ? ConsComplected() : ConsComplected
    }
    // A second pass is needed to define traits separately due to circular references
    for (let consName in dataDef) {
        const ConsComplected = complected[consName],
            proto = typeof ConsComplected === 'function' ?
                ConsComplected.prototype : ConsComplected.constructor.prototype
        Object.defineProperties(proto, {
            ...traits.reduce((acc, TraitCons) => {
                const methodName = TraitCons.name
                if (acc[methodName])
                    throw new TypeError(`Invalid traitDecl. Duplicate method name: '${methodName}'`);
                const t = new TraitCons(complected)
                acc[methodName] = {
                    enumerable: false,
                    value(...args) { return t[apply](this, ...args) }
                }
                return acc
            }, Object.create(null))
        })
    }

    return Object.freeze(complected)
}