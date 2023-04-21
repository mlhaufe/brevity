import { complect, data, trait } from "../index.mjs"

describe('Bool tests', () => {
    const boolData = data({ False: {}, True: {} })

    test('Bool traits', () => {
        const and = trait(boolData, {
            False(left, _) { return left },
            True(_, right) { return right }
        })

        const or = trait(boolData, {
            False(_, right) { return right },
            True(left, _) { return left }
        })

        const not = trait(boolData, {
            False() { return this.True },
            True() { return this.False }
        })

        const bool = complect(boolData, { and, or, not })
        const { False: f, True: t } = bool

        expect(f.and(f)).toBe(f)
        expect(f.and(t)).toBe(f)
        expect(t.and(f)).toBe(f)
        expect(t.and(t)).toBe(t)

        expect(f.or(f)).toBe(f)
        expect(f.or(t)).toBe(t)
        expect(t.or(f)).toBe(t)
        expect(t.or(t)).toBe(t)

        expect(f.not()).toBe(t)
        expect(t.not()).toBe(f)

        expect(() => and('string', f)).toThrow(TypeError)
    })
})