import { Data, Trait, apply, extend } from "../index.mjs"

describe('Extensibility for the Masses', () => {
    const IntExp = Data({ Lit: ['value'], Add: ['left', 'right'] })

    const intPrint = Trait(IntExp, {
        Lit({ value }) {
            return value.toString()
        },
        Add({ left, right }) {
            return `(${this[apply](left)} + ${this[apply](right)})`
        }
    })

    const intEval = Trait(IntExp, {
        Lit({ value }) { return value },
        Add({ left, right }) {
            return this[apply](left) + this[apply](right)
        }
    })

    test('IntExp', () => {
        const exp = IntExp.Add({
            left: IntExp.Lit({ value: 1 }),
            right: IntExp.Add({
                left: IntExp.Lit({ value: 2 }),
                right: IntExp.Lit({ value: 3 })
            })
        })

        expect(intPrint(exp)).toBe('(1 + (2 + 3))')
        expect(intEval(exp)).toBe(6)
    })

    const IntBoolExp = Data({
        [extend]: IntExp,
        Bool: ['value'],
        Iff: ['pred', 'ifTrue', 'ifFalse']
    })

    test('IntBoolExp Data', () => {
        expect(IntBoolExp.Lit).toBeDefined()
        expect(IntBoolExp.Add).toBeDefined()
        expect(IntBoolExp.Bool).toBeDefined()
        expect(IntBoolExp.Iff).toBeDefined()

        // if (true) 1 else 0
        const exp = IntBoolExp.Iff({
            pred: IntBoolExp.Bool({ value: true }),
            ifTrue: IntBoolExp.Lit({ value: 1 }),
            ifFalse: IntBoolExp.Lit({ value: 0 })
        })

        expect(exp.pred.value).toBe(true)
        expect(exp.ifTrue.value).toBe(1)
        expect(exp.ifFalse.value).toBe(0)
    })

    const intBoolPrint = Trait(IntBoolExp, {
        [extend]: intPrint,
        Bool({ value }) { return value.toString() },
        Iff({ pred, ifTrue, ifFalse }) {
            return `(${this[apply](pred)} ? ${this[apply](ifTrue)} : ${this[apply](ifFalse)})`
        }
    });

    test('intBoolPrint', () => {
        // if (true) 1 else 0
        const exp = IntBoolExp.Iff({
            pred: IntBoolExp.Bool({ value: true }),
            ifTrue: IntBoolExp.Lit({ value: 1 }),
            ifFalse: IntBoolExp.Lit({ value: 2 })
        })

        expect(intBoolPrint(exp)).toBe('(true ? 1 : 2)')
    })

    const intBoolEval = Trait(IntBoolExp, {
        [extend]: intEval,
        Bool({ value }) { return value },
        Iff({ pred, ifTrue, ifFalse }) {
            return this[apply](pred) ? this[apply](ifTrue) : this[apply](ifFalse)
        }
    })

    test('intBoolEval', () => {
        // if (true) 1 else 0
        const exp = IntBoolExp.Iff({
            pred: IntBoolExp.Bool({ value: true }),
            ifTrue: IntBoolExp.Lit({ value: 1 }),
            ifFalse: IntBoolExp.Lit({ value: 2 })
        })

        expect(intBoolEval(exp)).toBe(1)
    })

    const StmtExp = Data({
        [extend]: IntBoolExp,
        Assign: ['scope', 'name', 'value'],
        Expr: ['value'],
        Seq: ['first', 'second'],
        Var: ['scope', 'name']
    })

    test('StmtExp Data', () => {
        expect(StmtExp.Lit).toBeDefined()
        expect(StmtExp.Add).toBeDefined()
        expect(StmtExp.Bool).toBeDefined()
        expect(StmtExp.Iff).toBeDefined()
        expect(StmtExp.Assign).toBeDefined()
        expect(StmtExp.Expr).toBeDefined()
        expect(StmtExp.Seq).toBeDefined()
        expect(StmtExp.Var).toBeDefined()

        const scope = new Map()
        scope.set('x', 1)
        scope.set('y', 2)

        // x = y + 1
        const exp = StmtExp.Assign({
            scope,
            name: 'x',
            value: StmtExp.Add({
                left: StmtExp.Var({ scope, name: 'y' }),
                right: StmtExp.Lit({ value: 1 })
            })
        })

        expect(exp.scope).toBe(scope)
        expect(exp.name).toBe('x')
        expect(exp.value.left.name).toBe('y')
        expect(exp.value.right.value).toBe(1)
    })

    const stmtPrint = Trait(StmtExp, {
        [extend]: intBoolPrint,
        Assign({ name, value }) { return `${name} = ${this[apply](value)}` },
        Expr({ value }) { return this[apply](value) },
        Seq({ first, second }) { return `${this[apply](first)}; ${this[apply](second)}` },
        Var({ name }) { return name }
    })

    test('stmtPrint', () => {
        const scope = new Map()
        scope.set('x', 1)
        scope.set('y', 2)

        // x = y + 1
        const exp = StmtExp.Assign({
            scope,
            name: 'x',
            value: StmtExp.Add({
                left: StmtExp.Var({ scope, name: 'y' }),
                right: StmtExp.Lit({ value: 1 })
            })
        })

        expect(stmtPrint(exp)).toBe('x = (y + 1)')

        // x = y + 1; x = x + 1
        const exp2 = StmtExp.Seq({
            first: exp,
            second: StmtExp.Assign({
                scope,
                name: 'x',
                value: StmtExp.Add({
                    left: StmtExp.Var({ scope, name: 'x' }),
                    right: StmtExp.Lit({ value: 1 })
                })
            })
        })

        expect(stmtPrint(exp2)).toBe('x = (y + 1); x = (x + 1)')
    })

    const stmtEval = Trait(StmtExp, {
        [extend]: intBoolEval,
        Assign({ scope, name, value }) {
            return scope.set(name, this[apply](value)).get(name)
        },
        Expr({ value }) { return this[apply](value) },
        Seq({ first, second }) {
            this[apply](first)
            return this[apply](second)
        },
        Var({ scope, name }) { return scope.get(name) }
    })

    test('stmtEval', () => {
        const scope = new Map()
        scope.set('x', 1)
        scope.set('y', 2)

        // x = y + 1
        const exp = StmtExp.Assign({
            scope,
            name: 'x',
            value: StmtExp.Add({
                left: StmtExp.Var({ scope, name: 'y' }),
                right: StmtExp.Lit({ value: 1 })
            })
        })

        expect(stmtEval(exp)).toBe(3)
        expect(scope.get('x')).toBe(3)

        // x = y + 1; x = x + 1
        const exp2 = StmtExp.Seq({
            first: exp,
            second: StmtExp.Assign({
                scope,
                name: 'x',
                value: StmtExp.Add({
                    left: StmtExp.Var({ scope, name: 'x' }),
                    right: StmtExp.Lit({ value: 1 })
                })
            })
        })

        expect(stmtEval(exp2)).toBe(4)
        expect(scope.get('x')).toBe(4)

        // x = 3 + 4; if (true) { x = 9 + 2 } else { x = 3 + 1 };
        const exp3 = StmtExp.Seq({
            first: StmtExp.Assign({
                scope,
                name: 'x',
                value: StmtExp.Add({
                    left: StmtExp.Lit({ value: 3 }),
                    right: StmtExp.Lit({ value: 4 })
                })
            }),
            second: StmtExp.Expr({
                value: StmtExp.Iff({
                    pred: StmtExp.Bool({ value: true }),
                    ifTrue: StmtExp.Assign({
                        scope,
                        name: 'x',
                        value: StmtExp.Add({
                            left: StmtExp.Lit({ value: 9 }),
                            right: StmtExp.Lit({ value: 2 })
                        })
                    }),
                    ifFalse: StmtExp.Assign({
                        scope,
                        name: 'x',
                        value: StmtExp.Add({
                            left: StmtExp.Lit({ value: 3 }),
                            right: StmtExp.Lit({ value: 1 })
                        })
                    })
                })
            })
        })

        expect(stmtEval(exp3)).toBe(11)
    })
})
