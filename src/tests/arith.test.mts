import { Data, Trait, apply, isSingleton } from '../index.mjs'

describe('Arithmetic', () => {
    // data declaration
    const Exp = Data({ Lit: ['value'], Add: ['left', 'right'] }),
        { Add, Lit } = Exp

    test('Type checking parameters', () => {
        expect(Lit[isSingleton]).toBe(false)
        expect(Add[isSingleton]).toBe(false)

        expect(() => Lit({ value: 1 })).not.toThrow()
        expect(() => Lit(1)).not.toThrow()
        // FIXME: without more type info a single parameter is not enough to infer the type
        // since 'any' is a valid type for the first parameter.
        // @ts-expect-error
        Lit({ value: 1, foo: 2, bar: 3 })
        // @ts-expect-error
        Lit(1, 2)

        expect(() => Add({ left: Lit({ value: 1 }), right: Lit({ value: 2 }) })).not.toThrow()
        expect(() => Add(Lit(1), Lit(2))).not.toThrow()
        // @ts-expect-error
        Add({ left: Lit({ value: 1 }), right: Lit({ value: 2 }), extra: 3 })
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
        expect(Exp.Lit).toBeDefined()
        expect(Exp.Add).toBeDefined()

        // 1 + (2 + 3)
        const exp = Exp.Add({
            left: Exp.Lit(1),
            right: Exp.Add({
                left: Exp.Lit(2),
                right: Exp.Lit(3)
            })
        })

        expect(exp.left.value).toBe(1)
        expect(exp.right.left.value).toBe(2)
        expect(exp.right.right.value).toBe(3)
    })

    test('extra parameters throw', () => {
        expect(() => Exp.Add({ left: Exp.Lit(1), right: Exp.Lit(2), extra: 3 })).toThrow()
    })

    test('missing parameters throw', () => {
        expect(() => Exp.Add({ left: Exp.Lit(1) })).toThrow()
    })

    test('positional parameters', () => {
        // 1 + (2 + 3)
        const exp = Exp.Add(
            Exp.Lit(1),
            Exp.Add(
                Exp.Lit(2),
                Exp.Lit(3)
            )
        )

        expect(exp.left.value).toBe(1)
        expect(exp.right.left.value).toBe(2)
        expect(exp.right.right.value).toBe(3)
    })

    test('wrong number of parameters throw', () => {
        expect(() => Exp.Add(Exp.Lit(1))).toThrow()
        expect(() => Exp.Add(Exp.Lit(1), Exp.Lit(2), Exp.Lit(3))).toThrow()
    })

    test('evaluate', () => {
        // 1 + (2 + 3)
        const exp = Add({
            left: Lit({ value: 1 }),
            right: Add({
                left: Lit({ value: 2 }),
                right: Lit({ value: 3 })
            })
        })

        expect(evaluate(exp)).toBe(6)

        // 1 + (2 + 3) + 4
        // with positional parameters
        const exp2 = Add(
            Add(Lit(1),
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
        // 1 + (2 + 3)
        const exp = Add({
            left: Lit({ value: 1 }),
            right: Add({
                left: Lit({ value: 2 }),
                right: Lit({ value: 3 })
            })
        })

        expect(print(exp)).toBe('1 + 2 + 3')

        // 1 + (2 + 3) + 4
        // with positional parameters
        const exp2 = Add(
            Add(Lit(1),
                Add(Lit(2), Lit(3))
            ),
            Lit(4)
        )

        expect(print(exp2)).toBe('1 + 2 + 3 + 4')
    })

    const MulExp = Data(Exp, { Mul: ['left', 'right'] }),
        { Mul } = MulExp

    test('MulExp Data', () => {
        expect(MulExp.Lit).toBeDefined()
        expect(MulExp.Add).toBeDefined()
        expect(MulExp.Mul).toBeDefined()

        // 1 + (2 * 3)
        const exp = MulExp.Add({
            left: MulExp.Lit(1),
            right: MulExp.Mul({
                left: MulExp.Lit(2),
                right: MulExp.Lit(3)
            })
        })

        expect(exp.left.value).toBe(1)
        expect(exp.right.left.value).toBe(2)
        expect(exp.right.right.value).toBe(3)
    })

    const evalMul = Trait(evaluate, {
        Mul({ left, right }) { return this[apply](left) * this[apply](right) }
    })

    test('evalMul', () => {
        // 1 + (2 * 3)
        const exp = MulExp.Add({
            left: MulExp.Lit({ value: 1 }),
            right: MulExp.Mul({
                left: MulExp.Lit({ value: 2 }),
                right: MulExp.Lit({ value: 3 })
            })
        })

        expect(evalMul(exp)).toBe(7)
    })

    const printMul = Trait(print, {
        Mul({ left, right }: { left: }) { return `${printMul(left)} * ${printMul(right)}` }
    })

    test('printMul', () => {
        // 1 + (2 * 3)
        const exp = MulExp.Add({
            left: MulExp.Lit({ value: 1 }),
            right: MulExp.Mul({
                left: MulExp.Lit({ value: 2 }),
                right: MulExp.Lit({ value: 3 })
            })
        })

        expect(printMul(exp)).toBe('1 + 2 * 3')
    })

    const isValue = Trait({
        Lit({ value }) { return true },
        Add({ left, right }) { return false },
        Mul({ left, right }) { return false }
    })

    test('isValue', () => {
        // 1 + (2 * 3)
        const exp = MulExp.Add({
            left: MulExp.Lit({ value: 1 }),
            right: MulExp.Mul({
                left: MulExp.Lit({ value: 2 }),
                right: MulExp.Lit({ value: 3 })
            })
        })

        expect(isValue(exp)).toBe(false)
        expect(isValue(exp.left)).toBe(true)
        expect(isValue(exp.right)).toBe(false)
        expect(isValue(exp.right.left)).toBe(true)
        expect(isValue(exp.right.right)).toBe(true)
    })
})