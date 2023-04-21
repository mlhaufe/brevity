import { data, trait, _, apply, extend } from '../index.mjs'

describe('Partial Application', () => {
    test('add 3 numbers', () => {
        const add3 = trait(Number, {
            _: (a, b, c) => a + b + c
        })

        expect(add3[apply](1, 2, 3)).toBe(6)
        expect(add3[apply](_, 2, 3)(1)).toBe(6)
        expect(add3[apply](1, _, 3)(2)).toBe(6)
        expect(add3[apply](1, 2, _)(3)).toBe(6)
        expect(add3[apply](1, _, _)(2, 3)).toBe(6)
        expect(add3[apply](_, 2, _)(1, 3)).toBe(6)
        expect(add3[apply](_, _, 3)(1, 2)).toBe(6)
        expect(add3[apply](_, _, _)(1, 2, _)(3)).toBe(6)
        expect(add3[apply](_, _, _)(_, 2, _)(1, _)(3)).toBe(6);
        expect(add3[apply](_, _, _)(_, 2, _)(_, 3)(1)).toBe(6);
    })

    test('Linked List', () => {
        const listData = data({ Nil: {}, Cons: { head: {}, tail: {} } })

        const foldRight = trait(listData, {
            Nil: (self, fn, z) => z,
            Cons: ({ head, tail }, fn, z) => fn(head, tail.foldRight(fn, z))
        })

        //const concat = foldRight(_, Cons, _)
        const concat = trait(listData, {
            [extend]: foldRight,
            _: (self, other) => self.foldRight(Cons, other)
        })

        //const length = foldRight(_, (x, acc) => acc + 1, 0)
        const length = trait(listData, {
            [extend]: foldRight,
            _: (self) => self.foldRight((x, acc) => acc + 1, 0)
        })

        const list = trait(listData, { concat, foldRight, length }),
            { Nil, Cons } = list

        const list1 = Cons(1, Cons(2, Cons(3, Nil))),
            list2 = Cons(4, Cons(5, Cons(6, Nil)))

        expect(list1.length()).toBe(3)
        expect(list2.length()).toBe(3)
        expect(list1.concat(list2)).toEqual(
            Cons(1, Cons(2, Cons(3, Cons(4, Cons(5, Cons(6, Nil))))))
        )
    })
})