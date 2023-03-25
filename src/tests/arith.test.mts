import { Data, Trait, apply, extend } from '../index.mjs'

describe('Arithmetic', () => {
    // data declaration
    const Exp = Data({ Lit: ['value'], Add: ['left', 'right'] }),
        { Add, Lit } = Exp

    // operations
    const evaluate = Trait(Exp, {
        Lit({ value }) { return value },
        Add({ left, right }) {
            return this[apply](left) + this[apply](right)
        }
    })

    test('named parameters', () => {
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
        expect(() => Add({ left: Lit(1), right: Lit(2), extra: 3 })).toThrow()
    })

    test('missing parameters throw', () => {
        expect(() => Add({ left: Lit(1) })).toThrow()
    })

    test('positional parameters', () => {
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
        expect(() => Add(Lit(1))).toThrow()
        expect(() => Add(Lit(1), Lit(2), Lit(3))).toThrow()
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

    const print = Trait(Exp, {
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

    const MulExp = Data({
        [extend]: Exp,
        Mul: ['left', 'right']
    })

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

    const evalMul = Trait(MulExp, {
        [extend]: evaluate,
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

    const printMul = Trait(MulExp, {
        [extend]: print,
        Mul({ left, right }) { return `${this[apply](left)} * ${this[apply](right)}` }
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

    const isValue = Trait(MulExp, {
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