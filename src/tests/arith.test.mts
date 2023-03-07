import { Data, Trait, apply, isSingleton } from '../index.mjs'

describe('Arithmetic', () => {
    // data declaration
    const Exp = Data({ Lit: ['value'], Add: ['left', 'right'] })

    test('Type checking parameters', () => {
        const { Add, Lit } = Exp

        expect(Lit[isSingleton]).toBe(false)
        expect(Add[isSingleton]).toBe(false)

        expect(() => Lit({ value: 1 })).not.toThrow()
        expect(() => Lit(1)).not.toThrow()
        // FIXME: without more type info a single parameter is not enough to infer the type
        // since 'any' is a valid type for the first parameter.
        // @ts-expect-error
        Lit({ value: 1, foo: 2, bar: 3 })
        // @ts-expect-error
        Lit(1, 2) // TODO: this should throw and not just be a type error

        expect(() => Add({ left: Lit({ value: 1 }), right: Lit({ value: 2 }) })).not.toThrow()
        expect(() => Add(Lit(1), Lit(2))).not.toThrow()
        Add({
            left: Lit({ value: 1 }),
            right: Lit({ value: 2 }),
            // @ts-expect-error
            extra: 3
        })
        // @ts-expect-error
        Add(Lit(1), Lit(2), Lit(3))
    })

    // operations
    const evaluate = Trait({
        Lit({ value }) { return value },
        Add({ left, right }) {
            return this[apply](left) + this[apply](right)
        }
    })

    test('named parameters', () => {
        const { Add, Lit } = Exp

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()

        // 1 + (2 + 3)
        const exp = Add({
            left: Lit({ value: 1 }),
            right: Add({
                left: Lit({ value: 2 }),
                right: Lit({ value: 3 })
            })
        })

        expect(exp.left.value).toBe(1)
        expect(exp.right.left.value).toBe(2)
        expect(exp.right.right.value).toBe(3)
    })

    test('extra parameters throw', () => {
        const { Add, Lit } = Exp
        expect(() => Add({
            left: Lit(1),
            right: Lit(2),
            //@ts-expect-error
            extra: 3
        })).toThrow()
    })

    test('missing parameters throw', () => {
        // @ts-expect-error
        expect(() => Exp.Add({ left: Exp.Lit(1) })).toThrow()
    })

    test('positional parameters', () => {
        const { Add, Lit } = Exp
        // 1 + (2 + 3)
        const exp = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        expect(exp.left.value).toBe(1)
        expect(exp.right.left.value).toBe(2)
        expect(exp.right.right.value).toBe(3)
    })

    test('wrong number of parameters throw', () => {
        const { Add, Lit } = Exp
        // @ts-expect-error
        expect(() => Add(Lit(1))).toThrow()
        expect(() => Add(
            Lit(1),
            Lit(2),
            //@ts-expect-error
            Lit(3))
        ).toThrow()
    })

    test('evaluate', () => {
        const { Add, Lit } = Exp
        // 1 + (2 + 3)
        const exp = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        expect(evaluate(exp)).toBe(6)

        // 1 + (2 + 3) + 4
        // with positional parameters
        const exp2 = Add(
            Add(
                Lit(1),
                Add(Lit(2), Lit(3))
            ),
            Lit(4)
        )

        expect(evaluate(exp2)).toBe(10)
    })

    const print = Trait({
        Lit({ value }) { return `${value}` },
        Add({ left, right }) {
            return `${this[apply](left)} + ${this[apply](right)}`
        }
    })

    test('print', () => {
        const { Add, Lit } = Exp
        // 1 + (2 + 3)
        const exp = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        expect(print(exp)).toBe('1 + 2 + 3')

        // 1 + (2 + 3) + 4
        // with positional parameters
        const exp2 = Add(
            Add(
                Lit(1),
                Add(Lit(2), Lit(3))
            ),
            Lit(4)
        )

        expect(print(exp2)).toBe('1 + 2 + 3 + 4')
    })

    const MulExp = Data(Exp, { Mul: ['left', 'right'] })

    test('MulExp Data', () => {
        const { Add, Lit, Mul } = MulExp

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()
        expect(Mul).toBeDefined()

        // 1 + (2 * 3)
        const exp = Add(
            Lit(1),
            Mul(Lit(2), Lit(3))
        )

        expect(exp.left.value).toBe(1)
        expect(exp.right.left.value).toBe(2)
        expect(exp.right.right.value).toBe(3)
    })

    const evalMul = Trait(evaluate, {
        Mul({ left, right }) { return this[apply](left) * this[apply](right) }
    })

    test('evalMul', () => {
        const { Add, Lit, Mul } = MulExp
        // 1 + (2 * 3)
        const exp = Add(
            Lit(1),
            Mul(Lit(2), Lit(3))
        )

        expect(evalMul(exp)).toBe(7)
    })

    const printMul = Trait(print, {
        Mul({ left, right }) { return `${printMul(left)} * ${printMul(right)}` }
    })

    test('printMul', () => {
        const { Add, Lit, Mul } = MulExp
        // 1 + (2 * 3)
        const exp = Add(
            Lit(1),
            Mul(Lit(2), Lit(3))
        )

        expect(printMul(exp)).toBe('1 + 2 * 3')
    })

    const isValue = Trait({
        Lit({ value }) { return true },
        Add({ left, right }) { return false },
        Mul({ left, right }) { return false }
    })

    test('isValue', () => {
        const { Add, Lit, Mul } = MulExp
        // 1 + (2 * 3)
        const exp = Add(
            Lit(1),
            Mul(Lit(2), Lit(3))
        )

        expect(isValue(exp)).toBe(false)
        expect(isValue(exp.left)).toBe(true)
        expect(isValue(exp.right)).toBe(false)
        expect(isValue(exp.right.left)).toBe(true)
        expect(isValue(exp.right.right)).toBe(true)
    })
})