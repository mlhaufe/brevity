import { Data, Trait, _ } from "../index.mjs";

describe('List tests', () => {
    const List = Data({ Nil: [], Cons: ['head', 'tail'] });

    test('List Data', () => {
        const { Nil, Cons } = List;
        const nil = Nil,
            cons = Cons({ head: 1, tail: nil })

        expect(nil).toBe(List.Nil)
        expect(cons.head).toBe(1)
        expect(cons.tail).toBe(List.Nil)
    })

    const concat = Trait(List, {
        Nil({ }, ys) { return ys },
        Cons({ head, tail }, ys) {
            return List.Cons({ head, tail: concat(tail, ys) })
        }
    })

    test('List Concat', () => {
        const { Cons, Nil } = List;
        // [1, 2, 3]
        const xs = Cons(1, Cons(2, Cons(3, Nil))),
            // [4, 5, 6]
            ys = Cons(4, Cons(5, Cons(6, Nil))),
            // xs ++ ys == [1, 2, 3, 4, 5, 6]
            zs = concat(xs, ys);

        expect(zs.head).toBe(1)
        expect(zs.tail.head).toBe(2)
        expect(zs.tail.tail.head).toBe(3)
        expect(zs.tail.tail.tail.head).toBe(4)
        expect(zs.tail.tail.tail.tail.head).toBe(5)
        expect(zs.tail.tail.tail.tail.tail.head).toBe(6)
    });

    const length = Trait(List, {
        Nil() { return 0 },
        Cons({ head, tail }) { return 1 + length(tail) }
    });

    test('List Length', () => {
        const { Cons, Nil } = List
        // [1, 2, 3]
        const xs = Cons(1, Cons(2, Cons(3, Nil)));
        expect(length(xs)).toBe(3)
    });

    const isNil = Trait(List, {
        _: () => false,
        Nil: () => true
    });

    test('List isNil', () => {
        const { Cons, Nil } = List
        // [1, 2, 3]
        const xs = Cons(1, Cons(2, Cons(3, Nil)));
        expect(isNil(xs)).toBe(false)
        expect(isNil(Nil)).toBe(true)
    })

    test('List trait array destructuring', () => {
        const { Cons, Nil } = List

        const xs = Cons(1, Cons(2, Cons(3, Nil)));

        const isThree = Trait(List, {
            _: () => false,
            Cons: [
                [[_, [_, [_, Nil]]], () => true],
                [_, () => false]
            ]
        })

        expect(isThree(xs)).toBe(true)

        const ys = Cons(1, Cons(2, Cons(3, Cons(4, Nil))));

        expect(isThree(ys)).toBe(false)
    })
})
