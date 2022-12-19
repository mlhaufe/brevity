import { isData, typeName } from './Data.mjs';

const isTrait = Symbol('isTrait'),
    apply = Symbol('apply');

const protoTrait = () => { } // the apply proxy handler requires the target to be callable
protoTrait[isTrait] = true;
protoTrait[apply] = function (instance, ...args) {
    const name = instance[typeName],
        fn = this[name];
    if (!fn)
        throw new TypeError(`no trait defined for ${name}`)
    return fn(instance, ...args)
}

const callableProxyHandler = {
    apply(target, thisArg, args) {
        return target[apply](...args)
    }
}

/**
 * 
 * @param {*} Data 
 * @param {*} traits 
 * @returns 
 * @throws {TypeError} if data is not a Data declaration
 * @throws {TypeError} if traits is not an object literal
 * @throws {TypeError} if any trait is not a function
 * @throws {TypeError} if any trait targets a member that is not a member of the data
 * @example
 * const Color = Data({ Red: [], Green: [], Blue: [] })
 * const print = Trait(Color, {
 *     Red(){ return '#FF0000'},
 *     Green(){ return '#00FF00'},
 *     Blue(){ return '#0000FF'}
 * })
 * const color = Color.Red()
 * console.log(print(color)) // #FF0000
 * 
 * const List = Data({ Nil: [], Cons: ['head', 'tail'] })
 * const print = Trait(List, {
 *     Nil(){ return '[]' },
 *     Cons({ head, tail }){ return `[${head}, ${print(tail)}]` }
 * })
 * 
 * const list = List.Cons({ head: 1, tail: List.Cons({ head: 2, tail: List.Nil }) })
 * print(list) // [1, [2, []]]
 * 
 */
// Trait(Data, { ... })
// Trait(Data, baseTrait, { ... })
export function Trait(Data, baseTrait, traits) {
    if (!Data[isData])
        throw new TypeError(`data must be a Data declaration: ${Data}`);

    let localTraits = () => { } // The object must remain callable.
    if (baseTrait && traits) {
        if (!baseTrait[isTrait])
            throw new TypeError(`baseTrait must be a Trait: ${baseTrait}`)
        if (typeof traits !== 'object' || Array.isArray(traits))
            throw new TypeError('traits must be an object literal');
        Reflect.setPrototypeOf(localTraits, baseTrait)
        Object.assign(localTraits, traits);
    } else if (baseTrait && !traits) {
        if (typeof baseTrait !== 'object' || Array.isArray(baseTrait))
            throw new TypeError('traits must be an object literal');
        Reflect.setPrototypeOf(localTraits, protoTrait)
        Object.assign(localTraits, baseTrait);
    } else {
        throw new TypeError('Trait must be called with at least 2 arguments')
    }

    // each trait name must be a member of the data and must be a function
    for (const [name, trait] of Object.entries(localTraits)) {
        if (typeof trait !== 'function')
            throw new TypeError(`trait must be a function: ${name}`);
        if (!(name in Data))
            throw new TypeError(`trait must target a member of the data: ${name}`);
    }

    return new Proxy(localTraits, callableProxyHandler)
}
