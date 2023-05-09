import { complect, data, trait } from "../index.mjs"

describe('Point tests', () => {
    const pointData = data({
        Point2: { x: Number, y: Number },
        Point3: { x: Number, y: Number, z: Number }
    })

    const printable = trait(pointData, {
        Point2({ x, y }) { return `(${x}, ${y})` },
        Point3({ x, y, z }) { return `(${x}, ${y}, ${z})` }
    })

    const point = complect(pointData, { print: printable }),
        { Point2, Point3 } = point

    test('Point data', () => {
        const p2 = Point2({ x: 1, y: 2 });
        expect(p2).toBeDefined();

        expect(p2.x).toBe(1);
        expect(p2.y).toBe(2);
        expect(p2.z).toBeUndefined();

        const p3 = Point3({ x: 3, y: 4, z: 5 });
        expect(p3).toBeDefined();
        expect(p3.x).toBe(3);
        expect(p3.y).toBe(4);
        expect(p3.z).toBe(5);

        expect(() => Point2(1, '2')).toThrow();
    })

    test('Point print', () => {
        const p2 = Point2({ x: 1, y: 2 });
        expect(p2.print()).toBe('(1, 2)');

        const p3 = Point3({ x: 3, y: 4, z: 5 });
        expect(p3.print()).toBe('(3, 4, 5)');
    })
})