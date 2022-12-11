import { Algebra } from "../index.mjs"

describe('Point Algebra', () => {
    class PointAlgebra extends Algebra {
        Point2(x, y) { }
        Point3(x, y, z) { }
    }

    class PointData { }
    class Point2 extends PointData {
        constructor(x, y) {
            super()
            this.x = x
            this.y = y
        }
    }
    class Point3 extends PointData {
        constructor(x, y, z) {
            super()
            this.x = x
            this.y = y
            this.z = z
        }
    }

    class PointFactory extends PointAlgebra {
        Point2(x, y) { return new Point2(x, y) }
        Point3(x, y, z) { return new Point3(x, y, z) }
    }

    test('Point Factory', () => {
        const pf = new PointFactory(),
            p2 = pf.Point2(12, 3),
            p3 = pf.Point3(98, 104, 66)

        expect(p2).toBeInstanceOf(Point2)
        expect(p3).toBeInstanceOf(Point3)
        expect(p2.x).toBe(12)
        expect(p2.y).toBe(3)
        expect(p3.z).toBe(66)
    })

    class PointPrint extends PointAlgebra {
        Point2(x, y) {
            return {
                toString() { return `(${x}, ${y})` }
            }
        }
        Point3(x, y, z) {
            return {
                toString() { return `(${x}, ${y}, ${z})` }
            }
        }
    }

    test('Combined Point', () => {
        const Point = PointFactory.Merge(PointPrint),
            point = new Point(),
            p2 = point.Point2(12, 3),
            p3 = point.Point3(98, 104, 66)

        expect(p2).toBeInstanceOf(Point2)
        expect(p3).toBeInstanceOf(Point3)
        expect(p2.x).toBe(12)
        expect(p2.y).toBe(3)
        expect(p3.z).toBe(66)
        expect(p2.toString()).toBe('(12, 3)')
        expect(p3.toString()).toBe('(98, 104, 66)')
    })
})