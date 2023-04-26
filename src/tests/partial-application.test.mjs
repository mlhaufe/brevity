import { data, trait, Trait, _, extend, complect } from '../index.mjs'

describe('Partial Application', () => {
    test('add 3 numbers', () => {
        const add3 = trait(Number, {
            _: (a, b, c) => a + b + c
        })

        expect(add3.length).toBe(3)

        expect(add3(1, 2, 3)).toBe(6)

        expect(add3(_, 2, 3).length).toBe(1)
        expect(add3(_, 2, 3)(1)).toBe(6)

        expect(add3(1, _, 3).length).toBe(1)
        expect(add3(1, _, 3)(2)).toBe(6)

        expect(add3(1, 2, _).length).toBe(1)
        expect(add3(1, 2, _)(3)).toBe(6)

        expect(add3(1, _, _).length).toBe(2)
        expect(add3(1, _, _)(2, 3)).toBe(6)

        expect(add3(_, 2, _).length).toBe(2)
        expect(add3(_, 2, _)(1, 3)).toBe(6)

        expect(add3(_, _, 3).length).toBe(2)
        expect(add3(_, _, 3)(1, 2)).toBe(6)

        expect(add3(_, _, _).length).toBe(3)
        expect(add3(_, _, _)(1, 2, _)(3)).toBe(6)

        expect(add3(_, _, _)(_, 2, _)(1, _).length).toBe(1)
        expect(add3(_, _, _)(_, 2, _)(1, _)(3)).toBe(6);

        expect(add3(_, _, _)(_, 2, _)(_, 3).length).toBe(1);
        expect(add3(_, _, _)(_, 2, _)(_, 3)(1)).toBe(6);
    })

    test('Linked List', () => {
        const listData = data({ Nil: {}, Cons: { head: {}, tail: {} } })

        const foldRight = trait(listData, {
            Nil: (_self, unit, _merge) => unit,
            Cons: ({ head, tail }, unit, merge) => merge(head, tail.foldRight(unit, merge))
        })

        expect(foldRight).toBeInstanceOf(Trait)
        expect(foldRight.length).toBe(3)

        // TODO: can the thunk be replaced with a wildcard?
        // const concat = foldRight(_, _, _.Cons)
        // where _.Cons === this.Cons ? But how in a partial?
        const concat = foldRight(_, _, (h, t) => Cons(h, t))

        expect(concat.length).toBe(2)

        const length = foldRight(_, 0, (x, acc) => acc + 1)

        expect(length.length).toBe(1)

        const list = complect(listData, { concat, foldRight, length }),
            { Nil, Cons } = list

        const list1 = Cons(1, Cons(2, Cons(3, Nil))),
            list2 = Cons(4, Cons(5, Cons(6, Nil)))

        expect(length(list1)).toBe(3)
        expect(length(list2)).toBe(3)

        expect(list1.length()).toBe(3)
        expect(list2.length()).toBe(3)

        const list3 = Cons(1, Nil)

        expect(Nil.concat(Nil)).toBe(Nil)
        expect(Nil.concat(list3)).toBe(list3)

        expect(list3.concat(Nil)).toBe(list3)

        expect(Cons(1, Nil).concat(Cons(2, Nil))).toBe(Cons(1, Cons(2, Nil)))
        expect(list1.concat(list2)).toBe(
            Cons(1, Cons(2, Cons(3, Cons(4, Cons(5, Cons(6, Nil))))))
        )
    })
})