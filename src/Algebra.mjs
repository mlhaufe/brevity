const getMethodNames = (obj, methodNames = new Set()) => {
    return obj === null ? methodNames :
        getMethodNames(
            Object.getPrototypeOf(obj),
            new Set([...methodNames, ...Object.getOwnPropertyNames(obj)])
        )
}

const isCapitalized = (str) => str[0] === str[0].toUpperCase() && str[0] !== str[0].toLowerCase()

export class Algebra {
    /**
     * Converts the current algebra into an algrebra that returns empty objects
     * @returns {Algebra} an empty algebra
     */
    static Empty() {
        return class Empty extends this {
            constructor(...args) {
                super(...args)

                return new Proxy(this, {
                    get(target, name) {
                        const value = Reflect.get(target, name)
                        return typeof value === 'function' && isCapitalized(name) ?
                            () => Object.create(null) : value
                    }
                })
            }
        }
    }

    /**
     * Merges the current algebra with the provided algebras
     * @param  {...Algebra} algebras 
     * @returns  {Algebra} an algebra that merges the results of the given algebras
     */
    static Merge(...algebras) {
        const selfNames = [...getMethodNames(this.prototype)].filter(isCapitalized)
        selfNames.forEach(name => {
            algebras.forEach(Alg => {
                if (!Alg.prototype[name])
                    throw new TypeError(
                        `Algebra ${Alg.name} does not have method ${name}`
                    )
            })
        })

        return class Merged extends this {
            constructor(...args) {
                super(...args)
                const ags = algebras.map(Alg => new Alg(...args))

                return new Proxy(this, {
                    get(target, name, receiver) {
                        const value = Reflect.get(target, name)
                        return typeof value === 'function' && isCapitalized(name) ?
                            (...args) => {
                                const result = value.apply(receiver, args),
                                    otherResults = ags.reduce(
                                        (result, ags) => Object.assign(result, ags[name].apply(receiver, args)),
                                        Object.create(null)
                                    )
                                return Object.assign(result, otherResults)
                            } : value
                    }
                })
            }
        }
    }

    constructor() {
        if (new.target === Algebra)
            throw new TypeError('This class is abstract and should not be constructed directly')
    }

    // TODO: fold/unfold only make sense on (co)recursive structures
    // Introduce a RecData structure that extends Algebra?
    // Intreoduce Streams? How would Traits relate then?
    // RecData vs Data, Stream vs Trait?

    /**
     * TODO: should this be part of a Trait construct instead?
     * It's an obervation... 
     * @example
     * const product = List.fold({
     *    Nil: () => 1,
     *    Cons: (head, tail) => head * tail
     * })
     * 
     * // [1, 2, 3]
     * const myList = List.Cons(1, List.Cons(2, List.Cons(3, List.Nil())))
     * product(myList) // 6
     * 
     */
    // fold(monoid) {
    //     // abstract Unit(t: T): void;
    //     // abstract Merge(left: T, right: T): T;
    //     return (algebra) => {


    //     }
    // }

    // unfold(comonoid) {
    //     // abstract Zero(t: T): void;
    //     // abstract Split(t: T): [T, T];
    //     return (seed) => {

    //     }
    // }
}