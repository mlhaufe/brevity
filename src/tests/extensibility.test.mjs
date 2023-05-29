import { apply, data, trait, complect, dataDecl } from "../index.mjs"

describe('Extensibility for the Masses', () => {
    const IntExpData = data({
        Lit: { value: {} },
        Add: { left: {}, right: {} }
    })

    const IntPrintable = trait('print', {
        Lit({ value }) {
            return value.toString()
        },
        Add({ left, right }) {
            return `(${left.print()} + ${right.print()})`
        }
    })

    const IntEvaluable = trait('evaluate', {
        Lit({ value }) { return value },
        Add({ left, right }) {
            return left.evaluate() + right.evaluate()
        }
    })

    test('IntExp', () => {
        const { Lit, Add } = complect(IntExpData, [IntPrintable, IntEvaluable])()

        const e = Add({
            left: Lit(1),
            right: Add(Lit(2), Lit(3))
        })

        expect(e.print()).toBe('(1 + (2 + 3))')
        expect(e.evaluate()).toBe(6)
    })

    const IntBoolExpData = data(IntExpData, {
        Bool: { value: {} },
        IIf: { pred: {}, ifTrue: {}, ifFalse: {} }
    })

    test('IntBoolExp', () => {
        const IntBoolExp = complect(IntBoolExpData, [IntPrintable, IntEvaluable])

        const { Lit, Add, Bool, IIf } = IntBoolExp()

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()
        expect(Bool).toBeDefined()
        expect(IIf).toBeDefined()

        // if (true) 1 else 0
        const exp = IIf(Bool(true), Lit(1), Lit(0))

        expect(exp.pred.value).toBe(true)
        expect(exp.ifTrue.value).toBe(1)
        expect(exp.ifFalse.value).toBe(0)
    })

    const IntBoolPrintable = trait(IntPrintable, 'print', {
        Bool({ value }) { return value.toString() },
        IIf({ pred, ifTrue, ifFalse }) {
            return `(${pred.print()} ? ${ifTrue.print()} : ${ifFalse.print()})`
        }
    });

    test('IntBoolPrintable', () => {
        const { Bool, IIf, Lit } = complect(IntBoolExpData, [IntBoolPrintable])()

        const e = IIf(Bool(true), Lit(1), Lit(2))

        expect(e.print()).toBe('(true ? 1 : 2)')
    })

    const IntBoolEvaluable = trait(IntEvaluable, 'evaluate', {
        Bool({ value }) { return value },
        IIf({ pred, ifTrue, ifFalse }) {
            return pred.evaluate() ? ifTrue.evaluate() : ifFalse.evaluate()
        }
    })

    test('intBoolEval', () => {
        const { Bool, IIf, Lit } = complect(IntBoolExpData, [IntBoolEvaluable])()

        const e = IIf(Bool(true), Lit(1), Lit(2))

        expect(e.evaluate()).toBe(1)
    })

    const StmtExpData = data(IntBoolExpData, {
        Assign: { scope: {}, name: {}, value: {} },
        Expr: { value: {} },
        Seq: { first: {}, second: {} },
        Var: { scope: {}, name: {} }
    })

    test('StmtExp data', () => {
        const { Lit, Add, Bool, IIf, Assign, Expr, Seq, Var } = complect(StmtExpData)()

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()
        expect(Bool).toBeDefined()
        expect(IIf).toBeDefined()
        expect(Assign).toBeDefined()
        expect(Expr).toBeDefined()
        expect(Seq).toBeDefined()
        expect(Var).toBeDefined()

        const scope = new Map()
        scope.set('x', 1)
        scope.set('y', 2)

        // x = y + 1
        const e = Assign({
            scope,
            name: 'x',
            value: Add({
                left: Var({ scope, name: 'y' }),
                right: Lit(1)
            })
        })

        expect(e.scope).toBe(scope)
        expect(e.name).toBe('x')
        expect(e.value.left.name).toBe('y')
        expect(e.value.right.value).toBe(1)
    })

    const StmtPrintable = trait(IntBoolPrintable, 'print', {
        Assign({ name, value }) { return `${name} = ${value.print()}` },
        Expr({ value }) { return value.print() },
        Seq({ first, second }) { return `${first.print()}; ${second.print()}` },
        Var({ name }) { return name }
    })

    test('stmtPrint', () => {
        const Exp = complect(StmtExpData, [StmtPrintable])(),
            { Lit, Add, Bool, IIf, Assign, Expr, Seq, Var } = Exp

        const scope = new Map()
        scope.set('x', 1)
        scope.set('y', 2)

        // x = y + 1
        const e = Assign({
            scope,
            name: 'x',
            value: Add({
                left: Var({ scope, name: 'y' }),
                right: Lit(1)
            })
        })

        expect(e.print()).toBe('x = (y + 1)')

        // x = y + 1; x = x + 1
        const exp2 = Seq({
            first: e,
            second: Assign({
                scope,
                name: 'x',
                value: Add({
                    left: Var({ scope, name: 'x' }),
                    right: Lit(1)
                })
            })
        })

        expect(exp2.print()).toBe('x = (y + 1); x = (x + 1)')
    })

    const StmtEvaluable = trait(IntBoolEvaluable, 'evaluate', {
        Assign({ scope, name, value }) {
            return scope.set(name, value.evaluate()).get(name)
        },
        Expr({ value }) { return value.evaluate() },
        Seq({ first, second }) {
            first.evaluate()
            return second.evaluate()
        },
        Var({ scope, name }) { return scope.get(name) }
    })

    test('stmtEval', () => {
        const Exp = complect(StmtExpData, [StmtEvaluable])(),
            { Lit, Add, Bool, IIf, Assign, Expr, Seq, Var } = Exp

        const scope = new Map()
        scope.set('x', 1)
        scope.set('y', 2)

        // x = y + 1
        const e = Assign({
            scope,
            name: 'x',
            value: Add({
                left: Var({ scope, name: 'y' }),
                right: Lit(1)
            })
        })

        expect(e.evaluate()).toBe(3)
        expect(scope.get('x')).toBe(3)

        // x = y + 1; x = x + 1
        const e2 = Seq({
            first: e,
            second: Assign({
                scope,
                name: 'x',
                value: Add({
                    left: Var({ scope, name: 'x' }),
                    right: Lit(1)
                })
            })
        })

        expect(e2.evaluate()).toBe(4)
        expect(scope.get('x')).toBe(4)

        // x = 3 + 4; if (true) { x = 9 + 2 } else { x = 3 + 1 };
        const e3 = Seq({
            first: Assign({
                scope,
                name: 'x',
                value: Add({
                    left: Lit(3),
                    right: Lit(4)
                })
            }),
            second: Expr({
                value: IIf({
                    pred: Bool(true),
                    ifTrue: Assign({
                        scope,
                        name: 'x',
                        value: Add(Lit(9), Lit(2))
                    }),
                    ifFalse: Assign({
                        scope,
                        name: 'x',
                        value: Add(Lit(3), Lit(1))
                    })
                })
            })
        })

        expect(e3.evaluate()).toBe(11)
    })

    test('data extend complected', () => {
        const IntExp = complect(IntExpData, [IntPrintable, IntEvaluable])

        const IntBoolExpData = data(IntExp, {
            Bool: { value: {} },
            IIf: { pred: {}, ifTrue: {}, ifFalse: {} }
        })

        const { Lit, Add, Bool, IIf } = complect(IntBoolExpData)()

        expect(Lit).toBeDefined()
        expect(Add).toBeDefined()
        expect(Bool).toBeDefined()
        expect(IIf).toBeDefined()
    })

    test('trait extend complected', () => {
        const IntExp = complect(IntExpData, [IntPrintable, IntEvaluable])

        const IntBoolExpData = data(IntExp, {
            Bool: { value: {} },
            IIf: { pred: {}, ifTrue: {}, ifFalse: {} }
        })

        const IntBoolPrintable = trait(IntExp, 'print', {
            Bool({ value }) { return value ? 'true' : 'false' },
            IIf({ pred, ifTrue, ifFalse }) {
                return `if (${pred.print()}) { ${ifTrue.print()} } else { ${ifFalse.print()} }`
            }
        })

        const IntBoolEvaluable = trait(IntExp, 'evaluate', {
            Bool({ value }) { return value },
            IIf({ pred, ifTrue, ifFalse }) {
                return pred.evaluate() ? ifTrue.evaluate() : ifFalse.evaluate()
            }
        })

        const IntBoolExp = complect(IntBoolExpData, [IntBoolPrintable, IntBoolEvaluable])

        const { Lit, Add, Bool, IIf } = IntBoolExp()

        // if (true) { 1 + 2 } else { 3 + 4 }
        const e = IIf({
            pred: Bool(true),
            ifTrue: Add(Lit(1), Lit(2)),
            ifFalse: Add(Lit(3), Lit(4))
        })

        expect(e.print()).toBe('if (true) { (1 + 2) } else { (3 + 4) }')
        expect(e.evaluate()).toBe(3)
    })

    test("'super' trait call", () => {
        const FooData = data({
            Foo: { value: String }
        })

        const BasePrintable = trait('print', {
            Foo({ value }) { return `Base: ${value}` }
        })

        const OverridePrintable = trait(BasePrintable, 'print', {
            Foo({ value }) { return `Override: ${value}` }
        })

        const SuperPrintable = trait(BasePrintable, 'print', {
            Foo(self) { return `Super: ${BasePrintable[apply](this, self)}` }
        })

        const { Foo: FooOverride } = complect(FooData, [OverridePrintable])()
        const { Foo: FooSuper } = complect(FooData, [SuperPrintable])()

        expect(FooOverride('A').print()).toBe('Override: A')
        expect(FooSuper('A').print()).toBe('Super: Base: A')
    })
})
