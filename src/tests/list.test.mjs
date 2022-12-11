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

    class ListConcatTrait extends ListAlgebra {
        Nil() {
            return {
                concat(list) { return list }
            }
        }
        Cons(head, tail) {
            const family = this
            return {
                concat(list) {
                    return family.Cons(head, tail.concat(list))
                }
            }
        }
    }

    class ListLengthTrait extends ListAlgebra {
        Nil() {
            return {
                length() { return 0 }
            }
        }
        Cons(head, tail) {
            return {
                length() { return 1 + tail.length() }
            }
        }
    }

    test('List Concat', () => {
        const List = ListFactory.Merge(ListConcatTrait, ListLengthTrait),
            list = new List()
        // [1, 2, 3] ++ [4, 5, 6] = [1, 2, 3, 4, 5, 6]
        const l1 = list.Cons(1, list.Cons(2, list.Cons(3, list.Nil()))),
            l2 = list.Cons(4, list.Cons(5, list.Cons(6, list.Nil()))),
            l3 = l1.concat(l2)

        expect(l3.length()).toBe(6)
        expect(l3.head).toBe(1)
        expect(l3.tail.head).toBe(2)
        expect(l3.tail.tail.head).toBe(3)
        expect(l3.tail.tail.tail.head).toBe(4)
        expect(l3.tail.tail.tail.tail.head).toBe(5)
        expect(l3.tail.tail.tail.tail.tail.head).toBe(6)
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