import { data } from "../index.mjs";

describe('Equality tests', () => {
    test('data singleton equality', () => {
        const Color = data({ Red: {}, Green: {}, Blue: {} }),
            { Red, Green, Blue } = Color;

        expect(Red === Red).toBe(true);
        expect(Green === Green).toBe(true);
        expect(Blue === Blue).toBe(true);
        expect(Red === Green).toBe(false);
        expect(Red === Blue).toBe(false);
        expect(Green === Blue).toBe(false);
    })

    test('Point equality', () => {
        const Point = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = Point;

        const p2 = Point2({ x: 1, y: 2 }),
            p3 = Point3({ x: 1, y: 2, z: 3 });

        expect(p2 === p2).toBe(true);
        expect(p3 === p3).toBe(true);
        expect(p2 === p3).toBe(false);

        const p2_2 = Point2({ x: 1, y: 2 }),
            p3_2 = Point3({ x: 1, y: 2, z: 3 });

        expect(p2 === p2_2).toBe(true);
        expect(p3 === p3_2).toBe(true);
        expect(p2 === p3_2).toBe(false);
    })

    test('data arithmetic equality', () => {
        const Exp = data({
            Lit: { value: {} },
            Add: { left: {}, right: {} }
        }),
            { Add, Lit } = Exp

        // 1 + (2 + 3)
        const exp1 = Add(
            Lit(1),
            Add(
                Lit(2),
                Lit(3)
            )
        )

        // 1 + (2 + 3)
        const exp2 = Add(
            Lit(1),
            Add(
                Lit(2),
                Lit(3)
            )
        )

        // 1 + (2 + 4)
        const exp3 = Add(
            Lit(1),
            Add(Lit(2), Lit(4))
        )

        // 1 + (2 + 3)
        const exp4 = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        // reflexivity
        expect(exp1 === exp1).toBe(true);
        expect(exp2 === exp2).toBe(true);
        expect(exp3 === exp3).toBe(true);
        expect(exp4 === exp4).toBe(true);

        // symmetry
        expect(exp1 === exp2).toBe(exp2 === exp1);
        expect(exp1 === exp3).toBe(exp3 === exp1);
        expect(exp2 === exp3).toBe(exp3 === exp2);

        // transitivity
        expect(exp1 === exp2 && exp2 === exp4).toBe(exp1 === exp4);
    })

    test('data peano equality', () => {
        const Peano = data({ Zero: {}, Succ: { pred: {} } }),
            { Zero, Succ } = Peano,
            zero = Zero,
            one = Succ({ pred: zero }),
            two = Succ({ pred: one });

        expect(zero === zero).toBe(true);
        expect(zero === one).toBe(false);
        expect(zero === two).toBe(false);
        expect(one === zero).toBe(false);
        expect(one === one).toBe(true);
        expect(one === two).toBe(false);
        expect(two === zero).toBe(false);
        expect(two === one).toBe(false);
        expect(two === two).toBe(true);
    })

    test('Recursive data equality', () => {
        const List = data({ Nil: {}, Cons: { head: {}, tail: {} } }),
            { Cons, Nil } = List;

        const list1 = Cons(1, Cons(2, Cons(3, Nil))),
            list2 = Cons(1, Cons(2, Cons(3, Nil))),
            list3 = Cons(2, Cons(4, Cons(6, Nil)));

        expect(list1 === list2).toBe(true);
        expect(list1 === list3).toBe(false);
        expect(list2 === list3).toBe(false);
    })

    test('Array membership', () => {
        const Point = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = Point;

        const ps = [Point2(1, 2), Point3(1, 2, 3)];

        expect(ps.includes(Point2(1, 2))).toBe(true);
        expect(ps.includes(Point2({ x: 1, y: 2 }))).toBe(true);
        expect(ps.includes(Point3(1, 2, 3))).toBe(true);
        expect(ps.includes(Point3({ x: 1, y: 2, z: 3 }))).toBe(true)
        expect(ps.includes(Point2(1, 3))).toBe(false);
        expect(ps.includes(Point3(1, 2, 4))).toBe(false);
    })

    test('Set membership', () => {
        const Point = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = Point;

        const ps = new Set([Point2(1, 2), Point3(1, 2, 3)]);

        expect(ps.has(Point2(1, 2))).toBe(true);
        expect(ps.has(Point2({ x: 1, y: 2 }))).toBe(true);
        expect(ps.has(Point3(1, 2, 3))).toBe(true);
        expect(ps.has(Point3({ x: 1, y: 2, z: 3 }))).toBe(true)
        expect(ps.has(Point2(1, 3))).toBe(false);
        expect(ps.has(Point3(1, 2, 4))).toBe(false);
    })

    test('Map membership', () => {
        const Point = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = Point;

        const ps = new Map([
            [Point2(1, 2), 1],
            [Point3(1, 2, 3), 2]
        ]);

        expect(ps.has(Point2(1, 2))).toBe(true);
        expect(ps.has(Point2({ x: 1, y: 2 }))).toBe(true);
        expect(ps.has(Point3(1, 2, 3))).toBe(true);
        expect(ps.has(Point3({ x: 1, y: 2, z: 3 }))).toBe(true)
        expect(ps.has(Point2(1, 3))).toBe(false);
        expect(ps.has(Point3(1, 2, 4))).toBe(false);
    })
})