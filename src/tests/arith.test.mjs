import { Data, Trait, apply } from '../index.mjs'

describe('Arithmetic', () => {
    // data declaration
    const Exp = Data({ Lit: ['value'], Add: ['left', 'right'] })

    // operations
    const evaluate = Trait({
        Lit({ value }) { return value },
        Add({ left, right }) {
            return this[apply](left) + this[apply](right)
        }
    })

    test('evaluate', () => {
        // 1 + (2 + 3)
        const exp = Exp.Add({
            left: Exp.Lit({ value: 1 }),
            right: Exp.Add({
                left: Exp.Lit({ value: 2 }),
                right: Exp.Lit({ value: 3 })
            })
        })

        expect(evaluate(exp)).toBe(6)
    })

    const print = Trait({
        Lit({ value }) { return `${value}` },
        Add({ left, right }) {
            return `${this[apply](left)} + ${this[apply](right)}`
        }
    })

    test('print', () => {
        // 1 + (2 + 3)
        const exp = Exp.Add({
            left: Exp.Lit({ value: 1 }),
            right: Exp.Add({
                left: Exp.Lit({ value: 2 }),
                right: Exp.Lit({ value: 3 })
            })
        })

        expect(print(exp)).toBe('1 + 2 + 3')
    })

    const MulExp = Data(Exp, { Mul: ['left', 'right'] })

    test('MulExp Data', () => {
        expect(MulExp.Lit).toBeDefined()
        expect(MulExp.Add).toBeDefined()
        expect(MulExp.Mul).toBeDefined()

        // 1 + (2 * 3)
        const exp = MulExp.Add({
            left: MulExp.Lit({ value: 1 }),
            right: MulExp.Mul({
                left: MulExp.Lit({ value: 2 }),
                right: MulExp.Lit({ value: 3 })
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