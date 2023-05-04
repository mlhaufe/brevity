import { data, trait, complect, Data, Complected, Trait } from '../index.mjs'

describe('Instanceof tests', () => {
    const shapeData = data({
        Circle: { radius: {} },
        Rectangle: { width: {}, height: {} }
    })

    const area = trait(shapeData, {
        Circle({ radius }) { return Math.PI * radius * radius },
        Rectangle({ width, height }) { return width * height }
    })

    const shape = complect(shapeData, { area })

    test('data instanceof data constructor and factory', () => {
        const { Circle } = shapeData

        expect(shapeData).toBeInstanceOf(Data)

        const circle = Circle({ radius: 1 })

        expect(circle).toBeInstanceOf(Data)
        expect(circle).toBeInstanceOf(shapeData.constructor)
        expect(circle).toBeInstanceOf(shapeData.Circle)
    })

    test('trait instanceof trait constructor and Trait', () => {
        expect(area).toBeInstanceOf(Trait)
    })

    test('Complected tests', () => {
        expect(shape).toBeInstanceOf(Complected)
        expect(shape).toBeInstanceOf(shapeData)
        expect(shape).toBeInstanceOf(area)
    })
})