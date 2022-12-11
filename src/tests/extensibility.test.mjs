import { Algebra } from "../index.mjs"

// <https://www.cs.utexas.edu/~wcook/Drafts/2012/ecoop2012.pdf>
describe('Extensibility for the Masses', () => {
    class IntAlg extends Algebra {
        Lit(value) { }
        Add(left, right) { }
    }

    class ExpData { }
    class Lit extends ExpData {
        constructor(value) {
            super()
            this.value = value
        }
    }
    class Add extends ExpData {
        constructor(left, right) {
            super()
            this.left = left
            this.right = right
        }
    }

    class IntFactory extends IntAlg {
        Lit(value) { return new Lit(value) }
        Add(left, right) { return new Add(left, right) }
    }

    test('IntFactory', () => {
        const factory = new IntFactory()

        const exp = factory.Add(
            factory.Lit(1),
            factory.Add(
                factory.Lit(2),
                factory.Lit(3)
            )
        )

        expect(exp).toEqual(new Add(
            new Lit(1),
            new Add(
                new Lit(2),
                new Lit(3)
            )
        ))
    })

    class IntPrint extends IntAlg {
        Lit(value) {
            return { print() { return value.toString() } }
        }
        Add(left, right) {
            return { print() { return `${left.print()} + ${right.print()}` } }
        }
    }

    class IntEval extends IntAlg {
        Lit(value) {
            return { eval() { return value } }
        }
        Add(left, right) {
            return { eval() { return left.eval() + right.eval() } }
        }
    }

    test('Merge of IntFactory, IntPrint, IntEval', () => {
        const Int = IntFactory.Merge(IntPrint, IntEval)
        const ipe = new Int()

        const exp = ipe.Add(
            ipe.Lit(1),
            ipe.Add(
                ipe.Lit(2),
                ipe.Lit(3)
            )
        )

        expect(exp.print()).toEqual('1 + 2 + 3')
        expect(exp.eval()).toEqual(6)
    })

    class IntBoolAlg extends IntAlg {
        Bool(value) { }
        Iff(pred, truePart, falsePart) { }
    }

    class Bool extends ExpData {
        constructor(value) {
            super()
            this.value = value
        }
    }
    class Iff extends ExpData {
        constructor(pred, truePart, falsePart) {
            super()
            this.pred = pred
            this.truePart = truePart
            this.falsePart = falsePart
        }
    }

    class IntBoolFactory extends IntFactory {
        Bool(value) { return new Bool(value) }
        Iff(pred, truePart, falsePart) { return new Iff(pred, truePart, falsePart) }
    }

    test('IntBoolFactory', () => {
        const ibf = new IntBoolFactory()

        const exp = ibf.Add(
            ibf.Lit(1),
            ibf.Iff(
                ibf.Bool(true),
                ibf.Lit(2),
                ibf.Lit(3)
            )
        )

        expect(exp).toEqual(new Add(
            new Lit(1),
            new Iff(
                new Bool(true),
                new Lit(2),
                new Lit(3)
            )
        ))
    })

    class IntBoolPrint extends IntPrint {
        Bool(value) {
            return { print() { return value.toString() } }
        }
        Iff(pred, truePart, falsePart) {
            return {
                print() {
                    return `if(${pred.print()}) { ${truePart.print()} } else { ${falsePart.print()} }`
                }
            }
        }
    }

    class IntBoolEval extends IntEval {
        Bool(value) {
            return { eval() { return value } }
        }
        Iff(pred, truePart, falsePart) {
            return {
                eval() {
                    return pred.eval() ? truePart.eval() : falsePart.eval()
                }
            }
        }
    }

    test('Merge of IntBoolFactory, IntBoolPrint, IntBoolEval', () => {
        const Int = IntBoolFactory.Merge(IntBoolPrint, IntBoolEval)
        const ibpe = new Int()

        // 1 + if(true) { 2 } else { 3 }
        const exp = ibpe.Add(
            ibpe.Lit(1),
            ibpe.Iff(
                ibpe.Bool(true),
                ibpe.Lit(2),
                ibpe.Lit(3)
            )
        )

        expect(exp.print()).toEqual('1 + if(true) { 2 } else { 3 }')
        expect(exp.eval()).toEqual(3)
    })

    class StmtAlg extends IntBoolAlg {
        Var(name) { }
        Assign(name, exp) { }
        Expr(value) { }
        Comp(left, right) { }
    }

    class Var extends ExpData {
        constructor(scope, name) {
            super()
            this.scope = scope
            this.name = name
        }
    }
    class Assign extends ExpData {
        constructor(scope, name, exp) {
            super()
            this.scope = scope
            this.name = name
            this.exp = exp
        }
    }
    class Expr extends ExpData {
        constructor(value) {
            super()
            this.value = value
        }
    }
    class Comp extends ExpData {
        constructor(left, right) {
            super()
            this.left = left
            this.right = right
        }
    }

    class StmtFactory extends IntBoolFactory {
        map = new Map()

        Var(name) {
            return new Var(this.map, name)
        }
        Assign(name, exp) {
            return new Assign(this.map, name, exp)
        }
        Comp(left, right) {
            return new Comp(left, right)
        }
        Expr(value) {
            return new Expr(value)
        }
    }

    class StmtPrint extends IntBoolPrint {
        Var(name) {
            return { print() { return name } }
        }
        Assign(name, exp) {
            return { print() { return `${name} = ${exp.print()}` } }
        }
        Expr(value) {
            return { print() { return value.print() } }
        }
        Comp(left, right) {
            return {
                print() {
                    return `${left.print()}; ${right.print()}`
                }
            }
        }
    }

    class StmtEval extends IntBoolEval {
        Var(name) {
            return { eval() { return this.scope.get(name) } }
        }
        Assign(name, exp) {
            return {
                eval() {
                    return this.scope.set(name, exp.eval()).get(name)
                }
            }
        }
        Expr(value) {
            return { eval() { return value.eval() } }
        }
        Comp(left, right) {
            return {
                eval() {
                    left.eval()
                    return right.eval()
                }
            }
        }
    }

    const Stmt = StmtFactory.Merge(StmtPrint, StmtEval)

    test('StmtBuilder', () => {
        const s = new Stmt()

        // x = 3 + 4
        const stmt = s.Assign('x', s.Add(s.Lit(3), s.Lit(4)))

        expect(stmt.eval()).toBe(7);

        // x
        const v = s.Var('x')
        expect(v.eval()).toBe(7)

        // x = 11; 3 + 4
        const stmt2 = s.Comp(
            s.Assign('x', s.Lit(11)),
            s.Expr(s.Add(s.Lit(3), s.Lit(4)))
        )

        expect(stmt2.eval()).toBe(7)
        expect(stmt2.print()).toBe('x = 11; 3 + 4')
        expect(v.eval()).toBe(11)

        const v2 = s.Var('x')
        expect(v2.eval()).toBe(11)

        // x = 3 + 4; if (true) { x = 9 + 2 } else { x = 3 + 4 }; x + 1
        const stmt3 = s.Comp(
            s.Assign('x', s.Add(s.Lit(3), s.Lit(4))),
            s.Comp(
                s.Iff(
                    s.Bool(true),
                    s.Assign('x', s.Add(s.Lit(9), s.Lit(2))),
                    s.Assign('x', s.Add(s.Lit(3), s.Lit(4)))
                ),
                s.Expr(s.Add(s.Var('x'), s.Lit(1)))
            )
        )

        expect(stmt3.eval()).toBe(12)
    })
})