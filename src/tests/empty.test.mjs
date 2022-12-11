import { Algebra } from "../Algebra.mjs"

describe('Empty algebra', () => {
    class ColorAlg extends Algebra {
        Red() { }
        Green() { }
        Blue() { }
    }

    class ColorData { }
    class Red extends ColorData { }
    class Green extends ColorData { }
    class Blue extends ColorData { }

    class ColorFactory extends ColorAlg {
        Red() { return new Red() }
        Green() { return new Green() }
        Blue() { return new Blue() }
    }

    const ColorEmpty = ColorAlg.Empty()

    test('ColorEmpty methods', () => {
        const empty = new ColorEmpty()

        expect(empty).toBeInstanceOf(ColorEmpty)
        expect(empty).toBeInstanceOf(ColorAlg)
        expect(empty.Red).toBeInstanceOf(Function)
        expect(empty.Green).toBeInstanceOf(Function)
        expect(empty.Blue).toBeInstanceOf(Function)
    })

    test('ColorEmpty', () => {
        const empty = new ColorEmpty()

        expect(empty.Red()).toEqual({})
        expect(empty.Green()).toEqual({})
        expect(empty.Blue()).toEqual({})
    })
})