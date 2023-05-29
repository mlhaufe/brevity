import { complect, data, trait } from '../index.mjs'

describe('Arithmetic', () => {
    // data declaration
    const ExpData = data({
        Lit: { value: {} },
        Add: { left: {}, right: {} }
    })

    // operations
    const EvalTrait = trait('evaluate', {
        Lit({ value }) { return value },
        Add({ left, right }) {
            return left.evaluate() + right.evaluate()
        }
    })

    test('named parameters', () => {
        const { Lit, Add } = ExpData()

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
        const { Lit, Add } = ExpData()
        expect(() => Add({ left: Lit(1), right: Lit(2), extra: 3 })).toThrow()
    })

    test('missing parameters throw', () => {
        const { Lit, Add } = ExpData()
        expect(() => Add({ left: Lit(1) })).toThrow()
    })

    test('positional parameters', () => {
        const { Lit, Add } = ExpData()
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
        const { Lit, Add } = ExpData()
        expect(() => Add(Lit(1))).toThrow()
        expect(() => Add(Lit(1), Lit(2), Lit(3))).toThrow()
    })

    test('complect', () => {
        const Exp = complect(ExpData, [EvalTrait])
        const { Lit, Add } = Exp()

        const lit = Lit(4)

        expect(lit.evaluate).toBeDefined()
        expect(lit.evaluate()).toBe(4)

        const lit1 = Lit(1),
            lit2 = Lit(2),
            add = Add(lit1, lit2)

        expect(add.evaluate).toBeDefined()
        expect(add.evaluate()).toBe(3)

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

    const PrintTrait = trait('print', {
        Lit([value]) { return `${value}` },
        Add([left, right]) {
            return `${left.print()} + ${right.print()}`
        }
    })

    test('print', () => {
        const Exp = complect(ExpData, [PrintTrait])
        const { Lit, Add } = Exp()

        expect(Lit(4).print()).toBe('4')
        expect(Add(Lit(1), Lit(2)).print()).toBe('1 + 2')

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

    const EvaluablePrintable = trait('evalPrint', {
        Add({ left, right }) {
            return `${left.print()} + ${right.print()} = ${left.evaluate() + right.evaluate()}`
        },
        Lit({ value }) { return `${value}` }
    })

    test('evalPrint', () => {
        const Exp = complect(ExpData, [EvaluablePrintable, EvalTrait, PrintTrait])
        const { Lit, Add } = Exp()

        // 1 + (2 + 3)
        const e = Add(Lit(1), Add(Lit(2), Lit(3)))

        expect(e.evalPrint()).toBe('1 + 2 + 3 = 6')
    })

    const MulExpData = data(ExpData, {
        Mul: { left: {}, right: {} }
    })

    test('MulExp data', () => {
        const { Lit, Add, Mul } = MulExpData()

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()
        expect(Mul).toBeDefined()

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.left.value).toBe(1)
        expect(e.right.left.value).toBe(2)
        expect(e.right.right.value).toBe(3)
    })

    const EvaluableMul = trait(EvalTrait, 'evaluate', {
        Mul({ left, right }) { return left.evaluate() * right.evaluate() }
    })

    test('evalMul', () => {
        const Exp = complect(MulExpData, [EvaluableMul]),
            { Lit, Add, Mul } = Exp()

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.evaluate()).toBe(7)
    })

    const MulPrintable = trait(PrintTrait, 'print', {
        Mul([left, right]) { return `${left.print()} * ${right.print()}` }
    })

    test('printMul', () => {
        const Exp = complect(MulExpData, [MulPrintable]),
            { Lit, Add, Mul } = Exp()

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.print()).toBe('1 + 2 * 3')
    })

    const IsValuable = trait('isValue', {
        Lit() { return true },
        Add() { return false },
        Mul() { return false }
    })

    test('isValue', () => {
        const Exp = complect(MulExpData, [IsValuable]),
            { Lit, Add, Mul } = Exp()

        // 1 + (2 * 3)
        const e = Add(Lit(1), Mul(Lit(2), Lit(3)))

        expect(e.isValue()).toBe(false)
        expect(e.left.isValue()).toBe(true)
        expect(e.right.isValue()).toBe(false)
        expect(e.right.left.isValue()).toBe(true)
        expect(e.right.right.isValue()).toBe(true)
    })
})