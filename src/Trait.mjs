import { variantName } from './Data.mjs';

export const isTrait = Symbol('isTrait'),
    all = Symbol('all'),
    apply = Symbol('apply');

const protoTrait = () => { }
protoTrait[isTrait] = true;
protoTrait[apply] = function (instance, ...args) {
    const name = typeof instance === 'object' && instance !== null && variantName in instance ? instance[variantName] : all,
        fn = this[name] ?? this[all];
    if (!fn)
        throw new TypeError(`no trait defined for [all]`)

    return fn.call(this, instance, ...args)
}

/**
 * Defines a trait for a data declaration.
 * const traitFn = Trait(traits)
 * const result = traitFn(dataInstance, ...args)
 * @overload
 * @param {object} traits The traits to define.
 * @throws {TypeError} if traits is not an object literal
 * @throws {TypeError} if any trait is not a function 
 * @returns {function} a trait
 * @example
 * const List = Data({ Nil: [], Cons: ['head', 'tail'] })
 * const length = Trait({
 *     Nil() { return 0 },
 *     Cons({ head, tail }) { return 1 + length(tail) }
 * });
 * const { Nil, Cons } = List
 * // [1, 2, 3]
 * const xs = Cons({ head: 1, tail: Cons({ head: 2, tail: Cons({ head: 3, tail: Nil }) }) });
 * length(xs) // => 3
 *
 * @overload
 * Defines a trait for a data declaration that extends another trait.
 * const traitFn = Trait(baseTrait, traits)
 * const result = traitFn(dataInstance, ...args)
 * @param {object} baseTrait The trait to extend.
 * @param {object} traits The traits to define.
 * @throws {TypeError} if baseTrait is not a trait
 * @throws {TypeError} if traits is not an object literal
 * @throws {TypeError} if any trait is not a function
 * @returns {function} a trait
 * @example
 * const IntExp = Data({ Lit: ['value'], Add: ['left', 'right'] })
 * const intPrint = Trait({
 *     Lit({ value }) {
 *         return value.toString()
 *     },
 *     Add({ left, right }) {
 *         return `(${this[apply](left)} + ${this[apply](right)})`
 *     }
 * })
 * const IntBoolExp = Data(IntExp, { Bool: ['value'], Iff: ['pred', 'ifTrue', 'ifFalse'] })
 * const intBoolPrint = Trait(intPrint, {
 *     Bool({ value }) { return value.toString() },
 *     Iff({ pred, ifTrue, ifFalse }) {
 *         return `(${this[apply](pred)} ? ${this[apply](ifTrue)} : ${this[apply](ifFalse)})`
 *     }
 * });
 * // if (true) 1 else 0
 * const exp = IntBoolExp.Iff({
 *     pred: IntBoolExp.Bool({ value: true }),
 *     ifTrue: IntBoolExp.Lit({ value: 1 }),
 *     ifFalse: IntBoolExp.Lit({ value: 2 })
 * })
 */
export function Trait(...args) {
    const { baseTrait, traits } = args.length === 1 ?
        { traits: args[0] } : { baseTrait: args[0], traits: args[1] }
    let localTraits = (...args) => localTraits[apply](...args)

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