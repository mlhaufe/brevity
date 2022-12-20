import { Data, typeName } from "../Data.mjs"

describe('New trait test', () => {
    const apply = Symbol('apply')

    const protoTrait = {
        [apply](instance, ...args) {
            const name = instance[typeName],
                fn = this[name]
            if (!fn)
                throw new TypeError(`no trait defined for ${name}`)
            return fn.call(this, instance, ...args)
        }
    }

    function Trait(traits) {
        let localTraits = Object.create(protoTrait)
        if (traits) {
            if (typeof traits !== 'object' || Array.isArray(traits))
                throw new TypeError('traits must be an object literal')
            Object.assign(localTraits, traits)
        }
        return localTraits[apply].bind(localTraits)
    }

    const Point = Data({ Point2: ['x', 'y'] })

    const pointPrint = Trait({
        Point2({ x, y }) { return `Point2({x: ${x}, y: ${y}})` }
    })

    test('pointPrint', () => {
        const point = Point.Point2({ x: 1, y: 2 })
        expect(pointPrint(point)).toBe('Point2({x: 1, y: 2})')
    })
})