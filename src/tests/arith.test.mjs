import { complect, data, trait, extend } from '../index.mjs'

describe('Arithmetic', () => {
    // data declaration
    const expData = data({
        Lit: { value: {} },
        Add: { left: {}, right: {} }
    })

    // operations
    const evaluate = trait(expData, {
        Lit({ value }) { return value },
        Add({ left, right }) {
            return left.evaluate() + right.evaluate()
        }
    })

    test('named parameters', () => {
        const { Lit, Add } = expData

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()

        // 1 + (2 + 3)
        const e = Add({
            left: Lit({ value: 1 }),
            right: Add({
                left: Lit({ value: 2 }),
                right: Lit({ value: 3 })
            })
        })

        expect(e.left.value).toBe(1)
        expect(e.right.left.value).toBe(2)
        expect(e.right.right.value).toBe(3)
    })

    test('extra parameters throw', () => {
        const { Lit, Add } = expData
        expect(() => Add({ left: Lit(1), right: Lit(2), extra: 3 })).toThrow()
    })

    test('missing parameters throw', () => {
        const { Lit, Add } = expData
        expect(() => Add({ left: Lit(1) })).toThrow()
    })

    test('positional parameters', () => {
        const { Lit, Add } = expData
        // 1 + (2 + 3)
        const e = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        expect(e.left.value).toBe(1)
        expect(e.right.left.value).toBe(2)
        expect(e.right.right.value).toBe(3)
    })

    test('wrong number of parameters throw', () => {
        const { Lit, Add } = expData
        expect(() => Add(Lit(1))).toThrow()
        expect(() => Add(Lit(1), Lit(2), Lit(3))).toThrow()
    })

    test('evaluate as trait', () => {
        const exp = complect(expData, { evaluate })
        const { Lit, Add } = exp

        expect(Lit(4).evaluate()).toBe(4)

        // 1 + (2 + 3)
        const e = Add({
            left: Lit({ value: 1 }),
            right: Add({
                left: Lit({ value: 2 }),
                right: Lit({ value: 3 })
            })
        })

        expect(e.evaluate()).toBe(6)

        // 1 + (2 + 3) + 4
        // with positional parameters
        const e2 = Add(
            Add(Lit(1),
                Add(Lit(2), Lit(3))
            ),
            Lit(4)
        )

        expect(e2.evaluate()).toBe(10)
    })

    test('evaluate applied to complected as function', () => {
        const exp = complect(expData, { evaluate })
        const { Lit, Add } = exp

        expect(evaluate(Lit(4))).toBe(4)

        // 1 + (2 + 3)
        const e = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        expect(evaluate(e)).toBe(6)
        expect(e.evaluate()).toBe(6)
    })

    const print = trait(expData, {
        Lit([value]) { return `${value}` },
        Add([left, right]) {
            return `${left.print()} + ${right.print()}`
        }
    })

    test('print', () => {
        const exp = complect(expData, { print })
        const { Lit, Add } = exp

        // 1 + (2 + 3)
        const e = Add({
            left: Lit({ value: 1 }),
            right: Add({
                left: Lit({ value: 2 }),
                right: Lit({ value: 3 })
            })
        })

        expect(e.print()).toBe('1 + 2 + 3')

        // 1 + (2 + 3) + 4
        // with positional parameters
        const e2 = Add(
            Add(Lit(1),
                Add(Lit(2), Lit(3))
            ),
            Lit(4)
        )

        expect(e2.print()).toBe('1 + 2 + 3 + 4')
    })

    const evalPrint = trait(expData, {
        Add({ left, right }) {
            return `${left.print()} + ${right.print()} = ${left.evaluate() + right.evaluate()}`
        },
        Lit({ value }) { return `${value}` }
    })

    test('evalPrint', () => {
        const exp = complect(expData, { evalPrint, evaluate, print })
        const { Lit, Add } = exp

        // 1 + (2 + 3)
        const e = Add(Lit(1), Add(Lit(2), Lit(3)))

        expect(e.evalPrint()).toBe('1 + 2 + 3 = 6')
    })

    const mulExpData = data({
        [extend]: expData,
        Mul: { left: {}, right: {} }
    })

    test('MulExp data', () => {
        const { Lit, Add, Mul } = mulExpData

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()
        expect(Mul).toBeDefined()

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.left.value).toBe(1)
        expect(e.right.left.value).toBe(2)
        expect(e.right.right.value).toBe(3)
    })

    const evalMul = trait(mulExpData, {
        [extend]: evaluate,
        Mul({ left, right }) { return left.evaluate() * right.evaluate() }
    })

    test('evalMul', () => {
        const exp = complect(mulExpData, { evaluate: evalMul }),
            { Lit, Add, Mul } = exp

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.evaluate()).toBe(7)
    })

    const printMul = trait(mulExpData, {
        [extend]: print,
        Mul([left, right]) { return `${left.print()} * ${right.print()}` }
    })

    test('printMul', () => {
        const exp = complect(mulExpData, { print: printMul }),
            { Lit, Add, Mul } = exp

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.print()).toBe('1 + 2 * 3')
    })

    const isValue = trait(mulExpData, {
        Lit() { return true },
        Add() { return false },
        Mul() { return false }
    })

    test('isValue', () => {
        const exp = complect(mulExpData, { isValue }),
            { Lit, Add, Mul } = exp

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.isValue()).toBe(false)
        expect(e.left.isValue()).toBe(true)
        expect(e.right.isValue()).toBe(false)
        expect(e.right.left.isValue()).toBe(true)
        expect(e.right.right.isValue()).toBe(true)
    })
})