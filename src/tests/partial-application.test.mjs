import { Data, Trait, _ } from '../index.mjs'

describe('Partial Application', () => {
    test('add 3 numbers', () => {
        const add3 = Trait(Number, {
            _: (a, b, c) => a + b + c
        })

        expect(add3(1, 2, 3)).toBe(6)
        expect(add3(_, 2, 3)(1)).toBe(6)
        expect(add3(1, _, 3)(2)).toBe(6)
        expect(add3(1, 2, _)(3)).toBe(6)
        expect(add3(1, _, _)(2, 3)).toBe(6)
        expect(add3(_, 2, _)(1, 3)).toBe(6)
        expect(add3(_, _, 3)(1, 2)).toBe(6)
        expect(add3(_, _, _)(1, 2, _)(3)).toBe(6)
        expect(add3(_, _, _)(_, 2, _)(1, _)(3)).toBe(6);
        expect(add3(_, _, _)(_, 2, _)(_, 3)(1)).toBe(6);
    })

    test('Linked List', () => {
        const List = Data({ Nil: [], Cons: ['head', 'tail'] }),
            { Nil, Cons } = List

        const foldRight = Trait(List, {
            Nil: (self, fn, z) => z,
            Cons: ({ head, tail }, fn, z) => fn(head, foldRight(tail, fn, z))
        })

        const concat = foldRight(_, Cons, _)

        const length = foldRight(_, (x, acc) => acc + 1, 0)

        const list1 = Cons(1, Cons(2, Cons(3, Nil))),
            list2 = Cons(4, Cons(5, Cons(6, Nil)))

        expect(length(list1)).toBe(3)
        expect(length(list2)).toBe(3)
        expect(concat(list1, list2)).toEqual(
            Cons(1, Cons(2, Cons(3, Cons(4, Cons(5, Cons(6, Nil))))))
        )
    })
})