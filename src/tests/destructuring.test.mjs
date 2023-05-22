import { complect, data, trait } from "../index.mjs"

describe('Destructuring', () => {
    test(`Point data destructuring`, () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        }),
            { Point2, Point3 } = PointData;

        const p2 = Point2({ x: 1, y: 2 }),
            p3 = Point3({ x: 1, y: 2, z: 3 });

        const { x: x2, y: y2 } = p2;
        expect(x2).toBe(1);
        expect(y2).toBe(2);

        const { x: x3, y: y3, z: z3 } = p3;
        expect(x3).toBe(1);
        expect(y3).toBe(2);
        expect(z3).toBe(3);

        // array destructuring
        const [x2a, y2a] = p2;
        expect(x2a).toBe(1);
        expect(y2a).toBe(2);

        const [x3a, y3a, z3a] = p3;
        expect(x3a).toBe(1);
        expect(y3a).toBe(2);
        expect(z3a).toBe(3);
    })

    test('Complect destructuring', () => {
        const PointData = data({
            Point2: { x: {}, y: {} },
            Point3: { x: {}, y: {}, z: {} }
        })

        const Printable = trait('print', {
            Point2({ x, y }) { return `Point2(${x}, ${y})` },
            Point3({ x, y, z }) { return `Point3(${x}, ${y}, ${z})` }
        })

        const { Point2, Point3 } = complect(PointData, [Printable])

        const p2 = Point2({ x: 1, y: 2 }),
            p3 = Point3({ x: 1, y: 2, z: 3 });

        const { x: x2, y: y2 } = p2;
        expect(x2).toBe(1);
        expect(y2).toBe(2);

        const { x: x3, y: y3, z: z3 } = p3;
        expect(x3).toBe(1);
        expect(y3).toBe(2);
        expect(z3).toBe(3);

        // array destructuring
        const [x2a, y2a] = p2;
        expect(x2a).toBe(1);
        expect(y2a).toBe(2);

        const [x3a, y3a, z3a] = p3;
        expect(x3a).toBe(1);
        expect(y3a).toBe(2);
        expect(z3a).toBe(3);
    })
})