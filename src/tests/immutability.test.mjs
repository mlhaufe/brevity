import { data, complect } from "../index.mjs";

describe('Immutability', () => {

    test('data/complect declaration is immutable', () => {
        const colorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => colorData.Red = 1).toThrow(TypeError)

        const pointData = data({ Point: { x: {}, y: {} } })
        expect(() => pointData.Point = 1).toThrow(TypeError)

        const color = complect(colorData, {})
        expect(() => color.Red = 1).toThrow(TypeError)

        const point = complect(pointData, {})
        expect(() => point.Point = 1).toThrow(TypeError)
    })

    test('data/complect declaration is not extensible', () => {
        const colorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => colorData.Purple = []).toThrow(TypeError)

        const pointData = data({ Point: { x: {}, y: {} } })
        expect(() => pointData.Point3 = []).toThrow(TypeError)

        const color = complect(colorData, {})
        expect(() => color.Purple = []).toThrow(TypeError)

        const point = complect(pointData, {})
        expect(() => point.Point3 = []).toThrow(TypeError)
    })

    test('data/complect variant is not extensible', () => {
        const colorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => colorData.Red.value = '#FF0000').toThrow(TypeError)

        const pointData = data({ Point2: { x: {}, y: {} } }),
            p = pointData.Point2({ x: 1, y: 2 })
        expect(() => p.z = 3).toThrow(TypeError)

        const color = complect(colorData, {})
        expect(() => color.Red.value = '#FF0000').toThrow(TypeError)

        const point = complect(pointData, {})
        expect(() => point.Point2({ x: 1, y: 2 }).z = 3).toThrow(TypeError)
    })

    test('data/complect variant properties are immutable', () => {
        const pointData = data({ Point2: { x: {}, y: {} } })
        const p = pointData.Point2({ x: 1, y: 2 })

        expect(() => p.x = 3).toThrow(TypeError)
        expect(p.x).toBe(1)

        const point = complect(pointData, {})
        const p2 = point.Point2({ x: 1, y: 2 })

        expect(() => p2.x = 3).toThrow(TypeError)
        expect(p2.x).toBe(1)
    })
})