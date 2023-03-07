import { Data, Trait } from "../index.mjs";

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

    const concat = Trait({
        Nil({ }, ys) { return ys },
        Cons({ head, tail }, ys) {
            return List.Cons({ head, tail: concat(tail, ys) })
        }
    })

    test('List Concat', () => {
        const { Cons, Nil } = List;
        // [1, 2, 3]
        const xs = Cons({ head: 1, tail: Cons({ head: 2, tail: Cons({ head: 3, tail: Nil }) }) }),
            // [4, 5, 6]   
            ys = Cons({ head: 4, tail: Cons({ head: 5, tail: Cons({ head: 6, tail: Nil }) }) }),
            // xs ++ ys == [1, 2, 3, 4, 5, 6]    
            zs = concat(xs, ys);

        expect(zs.head).toBe(1)
        expect(zs.tail.head).toBe(2)
        expect(zs.tail.tail.head).toBe(3)
        expect(zs.tail.tail.tail.head).toBe(4)
        expect(zs.tail.tail.tail.tail.head).toBe(5)
        expect(zs.tail.tail.tail.tail.tail.head).toBe(6)
    });

    const length = Trait({
        Nil() { return 0 },
        Cons({ head, tail }) { return 1 + length(tail) }
    });

    test('List Length', () => {
        const { Cons, Nil } = List
        // [1, 2, 3]
        const xs = Cons({ head: 1, tail: Cons({ head: 2, tail: Cons({ head: 3, tail: Nil }) }) });
        expect(length(xs)).toBe(3)
    });
});
