import { complect, data, trait } from "../index.mjs";

describe('Equality tests', () => {
    test('complected equality', () => {
        const ColorData = data({ Red: {}, Green: {}, Blue: {} })

        const Printable = trait('print', {
            Red: () => 'Red',
            Green: () => 'Green',
            Blue: () => 'Blue'
        })

        const Color = complect(ColorData, [Printable])(),
            { Red, Green, Blue } = Color;

        expect(Red).toBe(Red);
        expect(Red).toBe(Color.Red);
        expect(Green).toBe(Green);
        expect(Green).toBe(Color.Green);
        expect(Blue).toBe(Blue);
        expect(Blue).toBe(Color.Blue);
    })

    test('Point equality', () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = new PointData();

        const p2 = Point2({ x: 1, y: 2 }),
            p3 = Point3({ x: 1, y: 2, z: 3 });

        expect(p2).toBe(p2);
        expect(p3).toBe(p3);
        expect(p2).not.toBe(p3);

        const p2_2 = Point2({ x: 1, y: 2 }),
            p3_2 = Point3({ x: 1, y: 2, z: 3 });

        expect(p2).toBe(p2_2);
        expect(p3).toBe(p3_2);
        expect(p2).not.toBe(p3_2);
    })

    test('complected point equality', () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        })

        const Printable = trait('print', {
            Point2: ({ x, y }) => `Point2(${x}, ${y})`,
            Point3: ({ x, y, z }) => `Point3(${x}, ${y}, ${z})`
        })

        const Point = complect(PointData, [Printable]),
            { Point2, Point3 } = Point();

        const p2 = Point2({ x: 1, y: 2 }),
            p3 = Point3({ x: 1, y: 2, z: 3 });

        expect(p2).toBe(p2);
        expect(p3).toBe(p3);
        expect(p2).not.toBe(p3);

        const p2_2 = Point2({ x: 1, y: 2 }),
            p3_2 = Point3({ x: 1, y: 2, z: 3 });

        expect(p2).toBe(p2_2);
        expect(p3).toBe(p3_2);
        expect(p2).not.toBe(p3_2);
    })

    test('data arithmetic equality', () => {
        const ExpData = data({
            Lit: { value: {} },
            Add: { left: {}, right: {} }
        }),
            { Add, Lit } = complect(ExpData)()

        // 1 + (2 + 3)
        const exp1 = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
        )

        // 1 + (2 + 3)
        const exp2 = Add(
            Lit(1),
            Add(Lit(2), Lit(3))
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
        expect(exp1).toBe(exp1);
        expect(exp2).toBe(exp2);
        expect(exp3).toBe(exp3);
        expect(exp4).toBe(exp4);

        // symmetry
        expect(exp1 === exp2).toBe(exp2 === exp1);
        expect(exp1 === exp3).toBe(exp3 === exp1);
        expect(exp2 === exp3).toBe(exp3 === exp2);

        // transitivity
        expect(exp1 === exp2 && exp2 === exp4).toBe(exp1 === exp4);
    })

    test('data peano equality', () => {
        const PeanoData = data({ Zero: {}, Succ: { pred: {} } }),
            { Zero, Succ } = complect(PeanoData)(),
            zero = Zero,
            one = Succ({ pred: zero }),
            two = Succ({ pred: one });

        expect(zero).toBe(zero);
        expect(zero).not.toBe(one);
        expect(zero).not.toBe(two);
        expect(one).not.toBe(zero);
        expect(one).toBe(one);
        expect(one).not.toBe(two);
        expect(two).not.toBe(zero);
        expect(two).not.toBe(one);
        expect(two).toBe(two);
    })

    test('Recursive data equality', () => {
        const ListData = data({ Nil: {}, Cons: { head: {}, tail: {} } }),
            { Cons, Nil } = complect(ListData)();

        const list1 = Cons(1, Cons(2, Cons(3, Nil))),
            list2 = Cons(1, Cons(2, Cons(3, Nil))),
            list3 = Cons(2, Cons(4, Cons(6, Nil)));

        expect(list1).toBe(list2);
        expect(list1 === list3).not.toBe(list3);
        expect(list2).not.toBe(list3);
    })

    test('Array membership', () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = complect(PointData)();

        const ps = [Point2(1, 2), Point3(1, 2, 3)];

        expect(ps.includes(Point2(1, 2))).toBe(true);
        expect(ps.includes(Point2({ x: 1, y: 2 }))).toBe(true);
        expect(ps.includes(Point3(1, 2, 3))).toBe(true);
        expect(ps.includes(Point3({ x: 1, y: 2, z: 3 }))).toBe(true)
        expect(ps.includes(Point2(1, 3))).toBe(false);
        expect(ps.includes(Point3(1, 2, 4))).toBe(false);
    })

    test('Set membership', () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = complect(PointData)();

        const ps = new Set([Point2(1, 2), Point3(1, 2, 3)]);

        expect(ps.has(Point2(1, 2))).toBe(true);
        expect(ps.has(Point2({ x: 1, y: 2 }))).toBe(true);
        expect(ps.has(Point3(1, 2, 3))).toBe(true);
        expect(ps.has(Point3({ x: 1, y: 2, z: 3 }))).toBe(true)
        expect(ps.has(Point2(1, 3))).toBe(false);
        expect(ps.has(Point3(1, 2, 4))).toBe(false);
    })

    test('Map membership', () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = complect(PointData)();

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