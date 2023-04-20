import { data } from "../index.mjs";

describe('Immutability', () => {

    test('data declaration is immutable', () => {
        const colorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => colorData.Red = 1).toThrow(TypeError)

        const pointData = data({ Point: { x: {}, y: {} } })
        expect(() => pointData.Point = 1).toThrow(TypeError)
    })

    test('data declaration is not extensible', () => {
        const colorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => colorData.Purple = []).toThrow(TypeError)

        const pointData = data({ Point: { x: {}, y: {} } })
        expect(() => pointData.Point3 = []).toThrow(TypeError)
    })

    test('data variant is not extensible', () => {
        const colorData = data({ Red: {}, Green: {}, Blue: {} })
        expect(() => colorData.Red.value = '#FF0000').toThrow(TypeError)

        const pointData = data({ Point2: { x: {}, y: {} } }),
            p = pointData.Point2({ x: 1, y: 2 })

        expect(() => p.z = 3).toThrow(TypeError)
    })

    test('data variant properties are immutable', () => {
        const pointData = data({ Point2: { x: {}, y: {} } })
        const p = pointData.Point2({ x: 1, y: 2 })

        expect(() => p.x = 3).toThrow(TypeError)
        expect(p.x).toBe(1)
    })
})