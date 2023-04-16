import { data } from "../index.mjs";

describe('Immutability', () => {

    test('data declaration is immutable', () => {
        const Color = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => Color.Red = 1).toThrow(TypeError)

        const Point = data({ Point: { x: {}, y: {} } })
        expect(() => Point.Point = 1).toThrow(TypeError)
    })

    test('data declaration is not extensible', () => {
        const Color = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => Color.Purple = []).toThrow(TypeError)

        const Point = data({ Point: { x: {}, y: {} } })
        expect(() => Point.Point3 = []).toThrow(TypeError)
    })

    test('data variant is not extensible', () => {
        const Color = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => Color.Red.value = '#FF0000').toThrow(TypeError)

        const Point = data({ Point2: { x: {}, y: {} } }),
            p = Point.Point2({ x: 1, y: 2 })

        expect(() => p.z = 3).toThrow(TypeError)
    })

    test('data variant properties are immutable', () => {
        const Point = data({ Point2: { x: {}, y: {} } })
        const p = Point.Point2({ x: 1, y: 2 })

        expect(() => p.x = 3).toThrow(TypeError)
        expect(p.x).toBe(1)
    })
})