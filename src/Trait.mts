export const isTrait = Symbol('isTrait'),
    all = Symbol('all'),
    apply = Symbol('apply');

// ref: <https://stackoverflow.com/questions/74917137/how-do-i-define-a-typescript-type-that-will-reduce-a-record-of-functions-to-an?noredirect=1#comment132216538_74917137>
export type TraitMethods<T> = { [K in keyof T]: (data: any, ...args: any[]) => any }
export type TraitFn<T> = (({ [K in keyof T]-?: (x: T[K]) => void }[keyof T] extends
    (this: TraitFn<T>, x: infer I) => void ? I : never))
    & { [isTrait]: boolean, [all]: TraitFn<T>, [apply]: TraitFn<T> }

const protoTrait = (() => { }) as TraitFn<any>
Reflect.set(protoTrait, isTrait, true)
Reflect.set(protoTrait, apply, function (this: TraitFn<any>, instance: any, ...args: any[]) {
    const name: string = instance.name,
        fn = this[name] ?? this[all];
    if (!fn)
        throw new TypeError(`no trait defined for ${name}`)
    return fn.call(this, instance, ...args)
})

/**
 * Defines a trait
 */
export function Trait<B extends TraitFn<any>, T extends TraitMethods<T>>(base: B, trait: T): B & TraitFn<T>;
export function Trait<T extends TraitMethods<T>>(traits: T): TraitFn<T>;
export function Trait<B extends TraitFn<any>, T extends TraitMethods<T>>(...args: any[]): B & TraitFn<T> {
    const { baseTrait, traits } = args.length === 1 ?
        { baseTrait: undefined, traits: args[0] } : { baseTrait: args[0], traits: args[1] }
    let localTraits: any = (...args: any[]) => localTraits[apply](...args)

    if (baseTrait && traits) {
        if (!baseTrait[isTrait])
            throw new TypeError(`baseTrait must be a Trait: ${baseTrait}`)
        if (typeof traits !== 'object' || Array.isArray(traits))
            throw new TypeError('traits must be an object literal');
        Reflect.setPrototypeOf(localTraits, baseTrait)
    } else if (!baseTrait && traits) {
        if (typeof traits !== 'object' || Array.isArray(traits))
            throw new TypeError('traits must be an object literal');
        Reflect.setPrototypeOf(localTraits, protoTrait)
    } else {
        throw new TypeError('Trait must be called with at least 2 arguments')
    }
    Object.assign(localTraits, traits);
    for (const [name, trait] of Object.entries(localTraits)) {
        if (typeof trait !== 'function')
            throw new TypeError(`trait must be a function: ${name}`);
    }

    return localTraits
}