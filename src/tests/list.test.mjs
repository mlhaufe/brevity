import { complect, data, trait, _, Pattern } from "../index.mjs";

describe('List tests', () => {
    const ListData = data((T) => ({
        Nil: {},
        Cons: { head: T, tail: ListData(T) }
    }));

    test('List data', () => {
        const List = complect(ListData),
            { Nil, Cons } = List(Number);

        expect(() =>
            Cons('1', Nil)
        ).toThrow();

        expect(() => {
            Cons(1, Cons(2, Cons(3, Nil)));
        }).not.toThrow();

        expect(() => {
            Cons(1, Cons(2, Cons('3', Nil)));
        }).toThrow();
    })

    const ConcatTrait = trait('concat', {
        Nil(self, ys) { return ys },
        Cons({ head, tail }, ys) {
            return this.Cons({ head, tail: tail.concat(ys) })
        }
    })

    const IsNilTrait = trait('isNil', {
        _: () => false,
        Nil: () => true
    });

    const IsThreeTrait = trait('isThree', {
        _: (_self) => false,
        Cons: Pattern(($) => [
            [[_, [_, [_, $.Nil]]], (_self) => true],
            [_, (_self) => false]
        ])
    })

    const LengthTrait = trait('length', {
        Nil(self) { return 0 },
        Cons({ head, tail }) { return 1 + tail.length() }
    });

    const List = complect(ListData, [ConcatTrait, IsNilTrait, IsThreeTrait, LengthTrait]),
        { Nil, Cons } = List(Number);

    test('List complect', () => {
        const xs = Cons({ head: 1, tail: Nil })

        expect(Nil).toBe(Nil)
        expect(xs.head).toBe(1)
        expect(xs.tail).toBe(Nil)

        expect(() => {
            Cons(1, Cons(2, Cons(3, Nil)));
        }).not.toThrow();

        expect(() => {
            Cons(1, Cons(2, Cons('3', Nil)));
        }).toThrow();
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
