import { Algebra } from "../index.mjs"

describe('Bool Algebra', () => {

    class BoolAlg extends Algebra {
        False() { }
        True() { }
    }

    class BoolData { }
    class False extends BoolData { }
    class True extends BoolData { }

    class BoolFactory extends BoolAlg {
        False() { return new False() }
        True() { return new True() }
    }

    test('Bool Factory', () => {
        const bf = new BoolFactory()

        expect(bf.False()).toBeInstanceOf(False)
        expect(bf.True()).toBeInstanceOf(True)
    })

    class BoolAnd extends BoolAlg {
        False() {
            return { and(other) { return this } }
        }
        True() {
            return { and(other) { return other } }
        }
    }

    class BoolOr extends BoolAlg {
        False() {
            return { or(other) { return other } }
        }
        True() {
            return { or(other) { return this } }
        }
    }

    class BoolNot extends BoolAlg {
        False() {
            return { not() { return new True() } }
        }
        True() {
            return { not() { return new False() } }
        }
    }

    test('Bool Traits', () => {
        const ba = new BoolAnd(),
            bo = new BoolOr(),
            bn = new BoolNot()

        expect(ba.False().and).toBeInstanceOf(Function)
        expect(ba.True().and).toBeInstanceOf(Function)

        expect(bo.False().or).toBeInstanceOf(Function)
        expect(bo.True().or).toBeInstanceOf(Function)

        expect(bn.False().not).toBeInstanceOf(Function)
        expect(bn.True().not).toBeInstanceOf(Function)
    })

    test('Bool Merged', () => {
        const Bool = BoolFactory.Merge(BoolAnd, BoolOr, BoolNot)

        const b = new Bool()

        expect(b.False().and(b.False())).toBeInstanceOf(False)
        expect(b.False().and(b.True())).toBeInstanceOf(False)
        expect(b.True().and(b.False())).toBeInstanceOf(False)
        expect(b.True().and(b.True())).toBeInstanceOf(True)

        expect(b.False().or(b.False())).toBeInstanceOf(False)
        expect(b.False().or(b.True())).toBeInstanceOf(True)
        expect(b.True().or(b.False())).toBeInstanceOf(True)
        expect(b.True().or(b.True())).toBeInstanceOf(True)

        expect(b.False().not()).toBeInstanceOf(True)
        expect(b.True().not()).toBeInstanceOf(False)

    })
})