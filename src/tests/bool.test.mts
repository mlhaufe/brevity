import { Data, isData, variant, Trait } from "../index.mjs"

describe('Bool tests', () => {
    const Bool = Data({ False: [], True: [] })

    test('Bool Data', () => {
        expect(Bool[isData]).toBe(true)

        const f = Bool.False,
            t = Bool.True

        expect(f[variant]).toBe(f)
        expect(t[variant]).toBe(t)
    })

    test('Bool traits', () => {
        const f = Bool.False,
            t = Bool.True

        const and = Trait(Bool, {
            False: (left, _) => left,
            True: (_, right) => right
        })

        expect(and(f, f)).toBe(f)
        expect(and(f, t)).toBe(f)
        expect(and(t, f)).toBe(f)
        expect(and(t, t)).toBe(t)

        const or = Trait(Bool, {
            False(_, right) { return right },
            True(left, _) { return left }
        })

        expect(or(f, f)).toBe(f)
        expect(or(f, t)).toBe(t)
        expect(or(t, f)).toBe(t)
        expect(or(t, t)).toBe(t)

        const not = Trait(Bool, {
            False: () => Bool.True,
            True: () => Bool.False
        })

        expect(not(f)).toBe(t)
        expect(not(t)).toBe(f)
    })
})