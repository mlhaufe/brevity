import { Data, isData, Trait, variantName } from "../index.mjs"

describe('Point tests', () => {
    const Point = Data({ Point2: ['x', 'y'], Point3: ['x', 'y', 'z'] })

    test('Point Data', () => {
        const Point = Data({ Point2: ['x', 'y'], Point3: ['x', 'y', 'z'] });
        expect(Point[isData]).toBe(true);

        const p2 = Point.Point2({ x: 1, y: 2 });
        expect(p2).toBeDefined();
        expect(p2[variantName]).toBe('Point2');
        expect(p2.x).toBe(1);
        expect(p2.y).toBe(2);
        expect(p2.z).toBeUndefined();

        const p3 = Point.Point3({ x: 3, y: 4, z: 5 });
        expect(p3).toBeDefined();
        expect(p3[variantName]).toBe('Point3');
        expect(p3.x).toBe(3);
        expect(p3.y).toBe(4);
        expect(p3.z).toBe(5);
    })

    const print = Trait({
        Point2({ x, y }) { return `(${x}, ${y})` },
        Point3({ x, y, z }) { return `(${x}, ${y}, ${z})` }
    })

    test('Point print', () => {
        const p2 = Point.Point2({ x: 1, y: 2 });
        expect(print(p2)).toBe('(1, 2)');

        const p3 = Point.Point3({ x: 3, y: 4, z: 5 });
        expect(print(p3)).toBe('(3, 4, 5)');
    })
})