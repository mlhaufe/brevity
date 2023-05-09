import { data, trait, extend, complect, dataDecl, traitDecl } from "../index.mjs"

describe('Extensibility for the Masses', () => {
    const intExpData = data({
        Lit: { value: {} },
        Add: { left: {}, right: {} }
    })

    const intPrint = trait(intExpData, {
        Lit({ value }) {
            return value.toString()
        },
        Add({ left, right }) {
            return `(${left.print()} + ${right.print()})`
        }
    })

    const intEval = trait(intExpData, {
        Lit({ value }) { return value },
        Add({ left, right }) {
            return left.evaluate() + right.evaluate()
        }
    })

    test('IntExp', () => {
        const exp = complect(intExpData, { print: intPrint, evaluate: intEval }),
            { Lit, Add } = exp

        const e = Add({
            left: Lit(1),
            right: Add(Lit(2), Lit(3))
        })

        expect(e.print()).toBe('(1 + (2 + 3))')
        expect(e.evaluate()).toBe(6)
    })

    const intBoolExpData = data({
        [extend]: intExpData,
        Bool: { value: {} },
        IIf: { pred: {}, ifTrue: {}, ifFalse: {} }
    })

    test('IntBoolExp data', () => {
        const { Lit, Add, Bool, IIf } = intBoolExpData

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

    const intBoolPrint = trait(intBoolExpData, {
        [extend]: intPrint,
        Bool({ value }) { return value.toString() },
        IIf({ pred, ifTrue, ifFalse }) {
            return `(${pred.print()} ? ${ifTrue.print()} : ${ifFalse.print()})`
        }
    });

    test('intBoolPrint', () => {
        const exp = complect(intBoolExpData, { print: intBoolPrint }),
            { Bool, IIf, Lit } = exp

        const e = IIf(Bool(true), Lit(1), Lit(2))

        expect(e.print()).toBe('(true ? 1 : 2)')
    })

    const intBoolEval = trait(intBoolExpData, {
        [extend]: intEval,
        Bool({ value }) { return value },
        IIf({ pred, ifTrue, ifFalse }) {
            return pred.evaluate() ? ifTrue.evaluate() : ifFalse.evaluate()
        }
    })

    test('intBoolEval', () => {
        const exp = complect(intBoolExpData, { evaluate: intBoolEval }),
            { Bool, IIf, Lit } = exp

        const e = IIf(Bool(true), Lit(1), Lit(2))

        expect(e.evaluate()).toBe(1)
    })

    const stmtExpData = data({
        [extend]: intBoolExpData,
        Assign: { scope: {}, name: {}, value: {} },
        Expr: { value: {} },
        Seq: { first: {}, second: {} },
        Var: { scope: {}, name: {} }
    })

    test('StmtExp data', () => {
        const { Lit, Add, Bool, IIf, Assign, Expr, Seq, Var } = stmtExpData

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

    const stmtPrint = trait(stmtExpData, {
        [extend]: intBoolPrint,
        Assign({ name, value }) { return `${name} = ${value.print()}` },
        Expr({ value }) { return value.print() },
        Seq({ first, second }) { return `${first.print()}; ${second.print()}` },
        Var({ name }) { return name }
    })

    test('stmtPrint', () => {
        const exp = complect(stmtExpData, { print: stmtPrint }),
            { Lit, Add, Bool, IIf, Assign, Expr, Seq, Var } = exp

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

    const stmtEval = trait(stmtExpData, {
        [extend]: intBoolEval,
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
        const exp = complect(stmtExpData, { evaluate: stmtEval }),
            { Lit, Add, Bool, IIf, Assign, Expr, Seq, Var } = exp

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
        const intExp = complect(intExpData, { print: intPrint, evaluate: intEval })

        const intBoolExpData = data({
            [extend]: intExp[dataDecl],
            Bool: { value: {} },
            IIf: { pred: {}, ifTrue: {}, ifFalse: {} }
        })

        expect(intBoolExpData.Lit).toBeDefined()
        expect(intBoolExpData.Add).toBeDefined()
        expect(intBoolExpData.Bool).toBeDefined()
        expect(intBoolExpData.IIf).toBeDefined()
    })

    test('trait extend complected', () => {
        const intExp = complect(intExpData, { print: intPrint, evaluate: intEval })

        const intBoolExpData = data({
            [extend]: intExp[dataDecl],
            Bool: { value: {} },
            IIf: { pred: {}, ifTrue: {}, ifFalse: {} }
        })

        const intBoolPrint = trait(intBoolExpData, {
            [extend]: intExp[traitDecl].print,
            Bool({ value }) { return value ? 'true' : 'false' },
            IIf({ pred, ifTrue, ifFalse }) {
                return `if (${pred.print()}) { ${ifTrue.print()} } else { ${ifFalse.print()} }`
            }
        })

        const intBoolEval = trait(intBoolExpData, {
            [extend]: intExp[traitDecl].evaluate,
            Bool({ value }) { return value },
            IIf({ pred, ifTrue, ifFalse }) {
                return pred.evaluate() ? ifTrue.evaluate() : ifFalse.evaluate()
            }
        })

        const intBoolExp = complect(intBoolExpData, { print: intBoolPrint, evaluate: intBoolEval })

        const { Lit, Add, Bool, IIf } = intBoolExp

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
        const fooData = data({
            Foo: { value: String }
        })

        const fooBaseTrait = trait(fooData, {
            Foo({ value }) { return `Base: ${value}` }
        })

        const fooOverrideTrait = trait(fooData, {
            [extend]: fooBaseTrait,
            Foo({ value }) { return `Override: ${value}` }
        })

        const fooSuperTrait = trait(fooData, {
            [extend]: fooBaseTrait,
            Foo(self) { return `Super: ${fooBaseTrait(self)}` }
        })

        const fooOverride = complect(fooData, { foo: fooOverrideTrait })
        const fooSuper = complect(fooData, { foo: fooSuperTrait })

        expect(fooOverride.Foo('A').foo()).toBe('Override: A')
        expect(fooSuper.Foo('A').foo()).toBe('Super: Base: A')
    })
})
