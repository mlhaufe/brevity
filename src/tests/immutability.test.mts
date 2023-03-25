import { Data } from "../index.mjs";

describe('Immutability', () => {

    test('Data declaration is immutable', () => {
        const Color = Data({ Red: [], Green: [], Blue: [] })
        // @ts-expect-error
        expect(() => Color.Red = 1).toThrow(TypeError)

        const Point = Data({ Point: ['x', 'y'] })
        // @ts-expect-error
        expect(() => Point.Point = 1).toThrow(TypeError)
    })

    test('Data declaration is not extensible', () => {
        const Color = Data({ Red: [], Green: [], Blue: [] })
        // @ts-expect-error
        expect(() => Color.Purple = []).toThrow(TypeError)

        const Point = Data({ Point: ['x', 'y'] })
        // @ts-expect-error
        expect(() => Point.Point3 = []).toThrow(TypeError)
    })

    test('Data variant is not extensible', () => {
        const Color = Data({ Red: [], Green: [], Blue: [] })
        // @ts-expect-error
        expect(() => Color.Red.value = '#FF0000').toThrow(TypeError)

        const Point = Data({ Point2: ['x', 'y'] }),
            p = Point.Point2({ x: 1, y: 2 })

        // @ts-expect-error
        expect(() => p.z = 3).toThrow(TypeError)
    })

    test('Data variant properties are immutable', () => {
        const Point = Data({ Point2: ['x', 'y'] })
        const p = Point.Point2({ x: 1, y: 2 })

        expect(() => p.x = 3).toThrow(TypeError)
        expect(p.x).toBe(1)
    })
})