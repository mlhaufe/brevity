import { isObjectLiteral, implies } from './utils/index.mjs';
import { extend, variant, isData } from './index.mjs';
import { DataConstructor, DataDef, DataSingleton, Variant } from './Data.mjs';
// TypeScript bug: <https://github.com/microsoft/TypeScript/issues/36931>
import * as asst from "./utils/assert.mjs"
const assert: typeof asst['assert'] = asst.assert;

export const isTrait = Symbol('isTrait'),
    all = Symbol('all'),
    apply = Symbol('apply');

type TraitDecl<D extends DataDef<any>> = {
    [Name in Extract<keyof D, string>]:
    D[Name] extends DataSingleton ? (instance: D[Name]) => any :
    D[Name] extends DataConstructor<infer PropNames> ?
    (instance: Variant<PropNames>, ...args: PropNames) => any :
    never
}
//  {
//     [all]?: (instance: Variant<any>, ...args: any[]) => any
//     [apply]?: (instance: unknown, ...args: any[]) => any
// }

type TraitDef = ((instance: unknown, ...args: any[]) => unknown) & {
    [all]?(...args: any[]): unknown
    [apply](instance: unknown, ...args: any[]): unknown
    [isTrait]: true
    [variant]?: unknown
}

const getAncestorFunctions = (() => {
    const cache = new WeakMap<object, Function[]>()
    return (object: object) => {
        if (cache.has(object))
            return cache.get(object)
        const fnValues = Object.values(object).filter(v => typeof v === 'function'),
            proto = Reflect.getPrototypeOf(object)
        if (proto !== null && isTrait in proto)
            cache.set(object, fnValues.concat(getAncestorFunctions(proto)))
        else
            cache.set(object, fnValues)
        return cache.get(object)
    }
})()

const protoTrait: TraitDef = Object.assign(
    ((instance: unknown, ...args: any[]) => protoTrait[apply](instance, ...args)),
    {
        [isTrait]: true as true,
        [apply](this: TraitDef, instance, ...args: any[]) {
            if (typeof instance === 'object' && instance !== null && variant in instance) {
                const vt = instance[variant],
                    fns = getAncestorFunctions(this)!,
                    // have to lookup by associated variant instead of by name
                    // because a trait can be defined for an anonymous data declaration
                    fn = fns.find(fn => fn[variant] === vt)

                if (fn) return fn.call(this, instance, ...args);

                // fallback to all
                if (all in this) return this[all]!.call(this, instance, ...args);

                throw new TypeError(`no trait defined for ${String(vt)}`)
            } else {
                throw new TypeError(`instance must be a variant: ${String(instance)}`)
            }
        }
    }
)

/**
 * Defines a trait for a data declaration.
 * @param dataDef The data definition to define the trait for.
 * @param traifDef The traits to define.
 * @throws {TypeError} if traits is not an object literal
 * @throws {TypeError} if dataDecl is not a data declaration
 * @throws {TypeError} if any trait is not a function
 * @returns The trait function
 */
export function Trait<D extends DataDef<any>, T extends TraitDecl<D>>(dataDef: D | undefined, traitDecl: T): TraitDef {
    let localTraits = ((...args: any[]) => localTraits[apply](...args)) as TraitDef

    assert(isObjectLiteral(traitDecl), 'traitDef must be an object literal');

    assert(implies(dataDef == undefined, all in traitDecl || apply in traitDecl),
        'Symbol(all) or Symbol(apply) must be defined if dataDecl is undefined');

    if (all in traitDecl) {
        assert(typeof traitDecl[all] === 'function', `Symbol(all) must be a function`);
        localTraits[all] = traitDecl[all];
    }

    if (apply in traitDecl) {
        assert(typeof traitDecl[apply] === 'function', `Symbol(apply) trait must be a function`);
        localTraits[apply] = traitDecl[apply];
    }

    Reflect.setPrototypeOf(localTraits,
        extend in traitDecl ? traitDecl[extend] : protoTrait
    )

    if (dataDef == undefined) return localTraits

    if (isData in dataDef) {
        if (!(all in traitDecl)) {
            // every name in dataDecl must be in traitDef
            assert(Object.keys(dataDef).every(name => name in traitDecl), `Every variant must have a trait defined`);
        } else {
            assert(typeof traitDecl[all] === 'function', `trait must be a function: Symbol(all)`);
            localTraits[all] = traitDecl[all];
        }

        // but we iterate over traitDef instead of dataDecl so we can associate the variant
        // since the it could have override entries
        for (const [name, f] of Object.entries(traitDecl)) {
            assert(typeof f === 'function', `trait must be a function: ${name}`);
            localTraits[name] = f;
            f[variant] = dataDef[name];
        }
    } else if (variant in dataDef.prototype) {
        // traitDef may only have one function. that is f
        assert(Object.keys(traitDecl).length === 1, `Only one trait may be defined for a variant declaration`);
        const [name, f] = Object.entries(traitDecl)[0];
        assert(typeof f === 'function', `trait must be a function: ${name}`);
        localTraits[name] = f;
        f[variant] = dataDef;
    } else {
        throw new TypeError(`dataDecl must be a data declaration or a variant declaration`)
    }

    return localTraits
}