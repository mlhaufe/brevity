import { data, complect } from "../index.mjs";

describe('Immutability', () => {

    test('data/complect declaration is immutable', () => {
        const ColorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => ColorData.Red = 1).toThrow(TypeError)

        const PointData = data({ Point: { x: {}, y: {} } })
        expect(() => PointData.Point = 1).toThrow(TypeError)

        const Color = complect(ColorData)
        expect(() => Color.Red = 1).toThrow(TypeError)

        const Point = complect(PointData)
        expect(() => Point.Point = 1).toThrow(TypeError)
    })

    test('data/complect declaration is not extensible', () => {
        const ColorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => ColorData.Purple = []).toThrow(TypeError)

        const PointData = data({ Point: { x: {}, y: {} } })
        expect(() => PointData.Point3 = []).toThrow(TypeError)

        const Color = complect(ColorData)
        expect(() => Color.Purple = []).toThrow(TypeError)

        const Point = complect(PointData)
        expect(() => Point.Point3 = []).toThrow(TypeError)
    })

    test('data/complect variant is not extensible', () => {
        const ColorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => ColorData.Red.value = '#FF0000').toThrow(TypeError)

        const PointData = data({ Point2: { x: {}, y: {} } }),
            p = PointData().Point2({ x: 1, y: 2 })
        expect(() => p.z = 3).toThrow(TypeError)

        const Color = complect(ColorData)
        expect(() => Color().Red.value = '#FF0000').toThrow(TypeError)

        const Point = complect(PointData)
        expect(() => Point().Point2({ x: 1, y: 2 }).z = 3).toThrow(TypeError)
    })

    test('data/complect variant properties are immutable', () => {
        const PointData = data({ Point2: { x: {}, y: {} } })
        const p = PointData().Point2({ x: 1, y: 2 })

        expect(() => p.x = 3).toThrow(TypeError)
        expect(p.x).toBe(1)

        const Point = complect(PointData)
        const p2 = Point().Point2({ x: 1, y: 2 })

        expect(() => p2.x = 3).toThrow(TypeError)
        expect(p2.x).toBe(1)
    })
})