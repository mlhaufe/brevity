import { Algebra } from "../index.mjs"

describe('List Algebra', () => {
    class ListAlgebra extends Algebra {
        Nil() { }
        Cons(head, tail) { }
    }

    class ListData { }
    class Nil extends ListData { }
    class Cons extends ListData {
        constructor(head, tail) {
            super()
            this.head = head
            this.tail = tail
        }
    }

    class ListFactory extends ListAlgebra {
        Nil() { return new Nil() }
        Cons(head, tail) { return new Cons(head, tail) }
    }

    test('List Factory', () => {
        const lf = new ListFactory(),
            nil = lf.Nil(),
            cons = lf.Cons(1, lf.Nil())

        expect(nil).toBeInstanceOf(Nil)
        expect(cons).toBeInstanceOf(Cons)
        expect(cons.head).toBe(1)
        expect(cons.tail).toBeInstanceOf(Nil)
    })

    // TODO
    // const counter = ListFactory.unfold({
    //     Zero: (t) => { },
    //     Split: (t) => 
    // })

    // test('Counter', () => {
    //     const c = counter(3)
    //     expect(c.head).toBe(3)
    //     expect(c.tail.head).toBe(2)
    //     expect(c.tail.tail.head).toBe(1)
    //     expect(c.tail.tail.tail.head).toBe(0)
    // })

    // const product = ListFactory.fold({
    //     Nil: () => 1,
    //     Cons: (head, tail) => head * tail
    // })

    // test('Product from List', () => {
    //     const p = product(counter(3))
    //     expect(p).toBe(120)
    // })
})