import { AlgDataType } from './AlgDataType.mjs';
import { Data } from './Data.mjs'

describe('Library tests', () => {
    test('Enumerated data', () => {
        const Color = Data({ Red: {}, Green: {}, Blue: {} });

        expect(Color).toBeDefined();

        const red = Color.Red,
            green = Color.Green,
            blue = Color.Blue;

        expect(red).toBe(Color.Red);
        expect(green).toBe(Color.Green);
        expect(blue).toBe(Color.Blue);

        expect(red).toBeInstanceOf(Color)
    })

    test('Data invariants', () => {
        expect(() => Data(12)).toThrow(`Invalid variant definition. Object literal or lambda expected`)
        expect(() => Data(Object)).toThrow('Invalid variant definition. Object literal or lambda expected')
        expect(() => Data()).not.toThrow()
        expect(() => Data({})).not.toThrow()

        expect(() =>
            Data({ red: {}, green: {}, blue: {} })
        ).toThrow('Invalid variant format')

        expect(() =>
            Data({ Red: {}, Green: {}, Blue: {} })
        ).not.toThrow()

        expect(() =>
            Data({ Red: {}, Green: {}, Blue: {}, Other: 17 })
        ).toThrow('Invalid variant definition. Object literal expected')

        expect(() =>
            Data({
                Point2: { x: Number.isFinite, y: Number.isFinite }
            })
        ).not.toThrow()

        expect(() =>
            Data({
                Point2: { X: Number.isFinite, Y: Number.isFinite }
            })
        ).toThrow('Invalid property format')

        expect(() =>
            Data({
                Foo: { bar: Function }
            })
        ).toThrow("'Function' is not an allowed property value")
    })

    test('Data with attributes and predicate guards', () => {
        const Point = Data({
            Point2: { x: Number.isFinite, y: Number.isFinite }
        })

        const pt = Point.Point2({ x: 3, y: 12 })

        expect(pt).toBeInstanceOf(Point.Point2)
        expect(pt).toBeInstanceOf(Point)

        expect(pt.x).toBe(3)
        expect(pt.y).toBe(12)

        expect(() => Point.Point2({ x: 3, y: '12' })).toThrow() // guard mismatch
        expect(() => Point.Point2({ x: 3 })).toThrow() // missing properties
        expect(() => Point.Point2({ x: 3, y: 12, extra: 19 })).toThrow() // too many properties
        expect(() => Point.Point2({ x: 3, u: 12 })).toThrow() // mis-named property
    })

    test('Data extensibility tests', () => {
        const Color = Data({ Red: {}, Green: {}, Blue: {} })
        const red = Color.Red

        expect(() => Color.Red = null).toThrow('Cannot assign to read only property')
        expect(() => Color.Blue = {}).toThrow('Cannot assign to read only property')
        expect(() => red.value = '#FF0000').toThrow('object is not extensible')
        expect(() => delete Color.Red).toThrow('Cannot delete property')

        const Point = Data({
            Point2: { x: Number.isFinite, y: Number.isFinite }
        })
        const pt = Point.Point2({ x: 3, y: 12 })

        expect(() => Point.Point2 = null).toThrow('Cannot assign to read only property')
        expect(() => Point.Point3 = "foo").toThrow('object is not extensible')
        expect(() => Point.Point2.z = "foo").toThrow('object is not extensible')
        expect(() => pt.z = 99).toThrow('object is not extensible')

        expect(pt.y).toBe(12)

        pt.y = 37

        expect(pt.y).toBe(37)
    })

    test('Data with attributes and Data reference as a guard', () => {
        const Color = Data({ Red: {}, Green: {}, Blue: {} });

        const ColorPoint = Data({
            Pt: { x: Number.isFinite, y: Number.isFinite, color: Color }
        })

        const pt = ColorPoint.Pt({ x: 12, y: 19, color: Color.Red })

        expect(pt).toBeInstanceOf(ColorPoint.Pt)
        expect(pt.color).toBe(Color.Red)
        expect(pt.color).toBeInstanceOf(Color)

        expect(() => pt.x = 104).not.toThrow()
        expect(() => pt.x = '104').toThrow('Type mismatch')
        expect(pt.x).toBe(104)

        expect(() =>
            ColorPoint.Pt({ x: 'foo', y: 19, color: Color.Red })
        ).toThrow('Type mismatch')

        expect(() =>
            ColorPoint.Pt({ x: 1109, y: 19, color: {} })
        ).toThrow('Type mismatch')

        const Box = Data({ BoxedDate: { value: Date } })

        const bd = Box.BoxedDate({ value: new Date() })

        expect(bd.value).toBeInstanceOf(Date)

        expect(() => bd.value = 12).toThrow('Type mismatch')
        expect(() => Box.BoxedDate({ value: 'foo' })).toThrow('Type mismatch')
    })

    test('Peano Numbers', () => {
        let Peano
        expect(() => {
            Peano = Data(({ self }) => ({
                Zero: {},
                Succ: { pred: self }
            }))
        }).not.toThrow()

        expect(Peano).toBeDefined()
        expect(() => Peano({ self: {} })).toThrow("'self' is implicit and should not be passed as an argument")
        expect(() => Peano({ foo: {} })).toThrow('Declaration mismatch.')

        const zero = Peano.Zero

        expect(zero).toBeDefined()
        expect(zero).toBeInstanceOf(Peano)
        expect(Peano.Succ).toBeDefined()

        let one
        expect(() => {
            one = Peano.Succ({ pred: zero })
        }).not.toThrow()

        expect(one).toBeDefined()
        expect(one).toBeInstanceOf(Peano.Succ)
        expect(one).toBeInstanceOf(Peano)
        expect(one.pred).toBe(zero)

        const two = Peano.Succ({ pred: one })
        expect(two.pred).toBe(one)


        // TODO: what if instead of 'self', Peano was referenced?
    })

    test('Linked List', () => {
        const List = Data(({ self, ofType }) => ({
            Nil: {},
            Cons: { head: ofType, tail: self }
        }))

        expect(List).toBeDefined()
        expect(Object.getPrototypeOf(List)).toBe(AlgDataType)

        let IntList
        expect(() => {
            IntList = List({ ofType: Number.isInteger })
        }).not.toThrow()
        expect(IntList).toBeDefined()

        // Is IntList <: List ?
        expect(IntList.Nil).toBeDefined()
        //     expect(IntList.Nil).toBeInstanceOf(IntList)

        //     // TODO: what if instead of 'self', List was referenced?
    })
})