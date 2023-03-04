import { Data } from "../index.mjs";

describe('Mutability', () => {

    test('Data declaration is immutable', () => {
        const Color = Data({ Red: [], Green: [], Blue: [] })
        expect(() => Color.Red = 1).toThrow(TypeError)

        const Point = Data({ Point: ['x', 'y'] })
        expect(() => Point.Point = 1).toThrow(TypeError)
    })

    test('Data declaration is not extensible', () => {
        const Color = Data({ Red: [], Green: [], Blue: [] })
        expect(() => Color.Purple = []).toThrow(TypeError)

        const Point = Data({ Point: ['x', 'y'] })
        expect(() => Point.Point3 = []).toThrow(TypeError)
    })

    test('Data variant is not extensible', () => {
        const Color = Data({ Red: [], Green: [], Blue: [] })
        expect(() => Color.Red.value = '#FF0000').toThrow(TypeError)

        const Point = Data({ Point2: ['x', 'y'] }),
            p = Point.Point2({ x: 1, y: 2 })

        expect(() => p.z = 3).toThrow(TypeError)
    })

    test('Data variant properties are mutable', () => {
        const Point = Data({ Point2: ['x', 'y'] })
        const p = Point.Point2({ x: 1, y: 2 })

        expect(() => p.x = 3).not.toThrow(TypeError)
        expect(p.x).toBe(3)
    })

    test('Assigning a function to a Data variant property should become a getter', () => {
        const Point = Data({ Point2: ['x', 'y'] })
        const p = Point.Point2({ x: 1, y: 2 })

        p.x = () => 3
        expect(p.x()).toBe(3)
    })
})