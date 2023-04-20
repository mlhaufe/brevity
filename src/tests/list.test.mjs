import { complect, data, trait, _ } from "../index.mjs";

describe('List tests', () => {
    const listData = data({ Nil: {}, Cons: { head: {}, tail: {} } });

    const concat = trait(listData, {
        Nil(self, ys) { return ys },
        Cons({ head, tail }, ys) {
            return this.Cons({ head, tail: tail.concat(ys) })
        }
    })

    const isNil = trait(listData, {
        _: () => false,
        Nil: () => true
    });

    const isThree = trait(listData, (f) => ({
        _: (_self) => false,
        Cons: [
            [[_, [_, [_, f.Nil]]], (_self) => true],
            [_, (_self) => false]
        ]
    }))

    const length = trait(listData, {
        Nil(self) { return 0 },
        Cons({ head, tail }) { return 1 + tail.length() }
    });

    const list = complect(listData, { concat, isNil, isThree, length }),
        { Nil, Cons } = list;

    test('List data', () => {
        const nil = Nil,
            cons = Cons({ head: 1, tail: nil })

        expect(nil).toBe(list.Nil)
        expect(cons.head).toBe(1)
        expect(cons.tail).toBe(list.Nil)
    })

    test('List Concat', () => {
        // [1, 2, 3]
        const xs = Cons(1, Cons(2, Cons(3, Nil))),
            // [4, 5, 6]
            ys = Cons(4, Cons(5, Cons(6, Nil))),
            // xs ++ ys == [1, 2, 3, 4, 5, 6]
            zs = xs.concat(ys);

        expect(zs.head).toBe(1)
        expect(zs.tail.head).toBe(2)
        expect(zs.tail.tail.head).toBe(3)
        expect(zs.tail.tail.tail.head).toBe(4)
        expect(zs.tail.tail.tail.tail.head).toBe(5)
        expect(zs.tail.tail.tail.tail.tail.head).toBe(6)
    });

    test('List Length', () => {
        // [1, 2, 3]
        const xs = Cons(1, Cons(2, Cons(3, Nil)));
        expect(xs.length()).toBe(3)
    });

    test('List isNil', () => {
        // [1, 2, 3]
        const xs = Cons(1, Cons(2, Cons(3, Nil)));
        expect(xs.isNil()).toBe(false)
        expect(Nil.isNil()).toBe(true)
    })

    test('List trait array destructuring', () => {
        const xs = Cons(1, Cons(2, Cons(3, Nil)));

        expect(xs.isThree()).toBe(true)

        const ys = Cons(1, Cons(2, Cons(3, Cons(4, Nil))));

        expect(ys.isThree()).toBe(false)
    })
})
