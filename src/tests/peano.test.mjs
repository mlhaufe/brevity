import { Algebra } from "../index.mjs"

describe('Peano Algebra', () => {
    class PeanoAlgebra extends Algebra {
        Zero() { }
        Succ(pred) { }
    }

    class PeanoData { }
    class Zero extends PeanoData { }
    class Succ extends PeanoData {
        constructor(pred) {
            super()
            this.pred = pred
        }
    }

    class PeanoFactory extends PeanoAlgebra {
        Zero() { return new Zero() }
        Succ(pred) { return new Succ(pred) }
    }

    test('Peano Factory', () => {
        const pf = new PeanoFactory(),
            zero = pf.Zero(),
            one = pf.Succ(zero),
            two = pf.Succ(one)

        expect(zero).toBeInstanceOf(Zero)
        expect(one).toBeInstanceOf(Succ)
        expect(two).toBeInstanceOf(PeanoData)
        expect(two.pred).toBe(one)
        expect(one.pred).toBe(zero)
    })
})