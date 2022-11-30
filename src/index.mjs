/**
 * A Monoid describes the concept of combining two elements of a type into a single element of the same type.
 */
class Monoid {
    // Also called '𝟙', 'Unit', 'Identity'
    static Empty() {
        class Empty extends this { }

        Object.getOwnPropertyNames(this.prototype)
            .filter(name => name != 'constructor')
            .forEach(name =>
                Object.defineProperty(Empty.prototype, name, {
                    value() { return Object.create(null) }
                })
            )

        return Empty
    }
    // F x F -> F
    // aka 'Combine', 'x'
    static Merge(monoid) {

    }
}

// Note that this forms a monoid, so a fold should come for free.
// So.... What would a Comonoid (CoAlgebra) look like?
// Are "Algebras" good for Traits, and "CoAlgebras" good for Factories?
// Would this then enable the niceties of the w3future article?
/**
 * An F-Algebra / Initial Algebra
 */
class Algebra extends Monoid {

    // merging Factories or Traits? or a combination?

    // need to drop the lifter
    static Combine(Other, lifter) {
        class Combined extends this { }

        const left = new this(),
            right = new Other(),
            namesLeft = Object.getOwnPropertyNames(this.prototype).filter(name => name != 'constructor'),
            namesRight = Object.getOwnPropertyNames(Other.prototype).filter(name => name != 'constructor');

        new Set([...namesLeft, ...namesRight])
            .forEach(name =>
                Object.defineProperty(Combined.prototype, name, {
                    value(...args) {
                        return lifter(left[name](...args), right[name](...args))
                    }
                })
            )

        return Combined
    }

    //Since any two elements of a type can be combined into a single type, then so can an arbitrary number of those types.
    // Therefore a reduce/fold/merge/aggregate/catamorphism operation comes for free.
}


/**
 * A CoMonoid describes the concept of separating two elements of a type into two elements of the same type.
 */
class CoMonoid {
    // Also called '𝟘', 'destroy'


    // F -> F x F
    static Separate() { }
}

/*
    F-CoAlgebra / (Final|Terminal) CoAlgebra
 */
class CoAlgebra extends CoMonoid {
    // get an generator/unfold/separator/anamorphism for free
}

// BiMonoid
// BiAlgebra?
// BiAlgebra = Algebra + CoAlgebra?
// Object = BiAlgebra?

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
class ExpAlgebra extends Algebra {
    Lit(value) { throw new Error('Not implemented') }
    Add(left, right) { thrq new Error('Not implemented') }
}


// Data
class ExpData { }
class Lit extends ExpData {
    constructor(value) {
        super();
        this.value = value
    }
}
class Add extends ExpData {
    constructor(left, right) {
        super()
        this.left = left
        this.right = right
    }
}

// Factory
class ExpFactory extends ExpAlgebra {
    Lit(x) { return new Lit(x) }
    Add(left, right) { return new Add(left, right) }
}

// Traits
class ExpEval extends ExpAlgebra {
    Lit(x) { return { eval: () => x } }
    Add(left, right) { return { eval: () => left + right } }
}

class ExpPrint extends ExpAlgebra {
    Lit(x) { return { print: () => `Lit(${x})` } }
    Add(left, right) { return { print: () => `Add(${left} + ${right})` } }
}

// merge traits. If you knew the algebras were traits, then the lifter is unneeded right?
// unless the same trait exists already?
const ExpEvalPrint = ExpEval.Combine(ExpPrint, (left, right) => ({
    eval: left.eval,
    print: right.print
}))
// const eep = new ExpEvalPrint()

// console.log(eep.Add(3,2).eval())

