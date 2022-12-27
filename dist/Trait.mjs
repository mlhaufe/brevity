export const isTrait = Symbol('isTrait'), all = Symbol('all'), apply = Symbol('apply');
const protoTrait = (() => { });
Reflect.set(protoTrait, isTrait, true);
Reflect.set(protoTrait, apply, function (instance, ...args) {
    const name = instance.name, fn = this[name] ?? this[all];
    if (!fn)
        throw new TypeError(`no trait defined for ${name}`);
    return fn.call(this, instance, ...args);
});
export function Trait(...args) {
    const { baseTrait, traits } = args.length === 1 ?
        { baseTrait: undefined, traits: args[0] } : { baseTrait: args[0], traits: args[1] };
    let localTraits = (...args) => localTraits[apply](...args);
    if (baseTrait && traits) {
        if (!baseTrait[isTrait])
            throw new TypeError(`baseTrait must be a Trait: ${baseTrait}`);
        if (typeof traits !== 'object' || Array.isArray(traits))
            throw new TypeError('traits must be an object literal');
        Reflect.setPrototypeOf(localTraits, baseTrait);
    }
    else if (!baseTrait && traits) {
        if (typeof traits !== 'object' || Array.isArray(traits))
            throw new TypeError('traits must be an object literal');
        Reflect.setPrototypeOf(localTraits, protoTrait);
    }
    else {
        throw new TypeError('Trait must be called with at least 2 arguments');
    }
    Object.assign(localTraits, traits);
    for (const [name, trait] of Object.entries(localTraits)) {
        if (typeof trait !== 'function')
            throw new TypeError(`trait must be a function: ${name}`);
    }
    return localTraits;
}
