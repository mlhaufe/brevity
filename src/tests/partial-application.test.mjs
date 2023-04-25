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
            Nil: (_self, _fn, z) => z,
            Cons: ({ head, tail }, fn, z) => fn(head, tail.foldRight(fn, z))
        })

        expect(foldRight).toBeInstanceOf(Trait)

        expect(foldRight.length).toBe(3)

        //const concat = foldRight(_, Cons, _)
        // const concat = trait(listData, {
        //     [extend]: foldRight,
        //     _: (self, other) => self.foldRight(Cons, other)
        // })

        // expect(concat.length).toBe(2)

        const length = foldRight(_, (x, acc) => acc + 1, 0)
        // const length = trait(listData, {
        //     [extend]: foldRight,
        //     _: (self) => self.foldRight((x, acc) => acc + 1, 0)
        // })

        expect(length.length).toBe(1)

        const list = complect(listData, { /* concat, */ foldRight, length }),
            { Nil, Cons } = list

        const list1 = Cons(1, Cons(2, Cons(3, Nil))),
            list2 = Cons(4, Cons(5, Cons(6, Nil)))

        expect(length(list1)).toBe(3)
        expect(length(list2)).toBe(3)

        expect(list1.length()).toBe(3)
        expect(list2.length()).toBe(3)
        // expect(list1.concat(list2)).toEqual(
        //     Cons(1, Cons(2, Cons(3, Cons(4, Cons(5, Cons(6, Nil))))))
        // )
    })
})