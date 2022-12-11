import { Algebra } from "../index.mjs"

describe('Color Algebra', () => {
    class ColorAlgebra extends Algebra {
        Red() { }
        Green() { }
        Blue() { }
    }

    class ColorData { }
    class Red extends ColorData { }
    class Green extends ColorData { }
    class Blue extends ColorData { }

    class ColorFactory extends ColorAlgebra {
        Red() { return new Red() }
        Green() { return new Green() }
        Blue() { return new Blue() }
    }

    test('Color Factory', () => {
        const cf = new ColorFactory()

        expect(cf.Red()).toBeInstanceOf(Red)
        expect(cf.Green()).toBeInstanceOf(Green)
        expect(cf.Blue()).toBeInstanceOf(Blue)
    })

    class Printable extends ColorAlgebra {
        Red() {
            return { print() { return '#FF0000' } }
        }
        Green() {
            return { print() { return '#00FF00' } }
        }
        Blue() {
            return { print() { return '#0000FF' } }
        }
    }

    test('Color Traits', () => {
        const cp = new Printable()

        expect(cp.Red().print).toBeInstanceOf(Function)
        expect(cp.Green().print).toBeInstanceOf(Function)
        expect(cp.Blue().print).toBeInstanceOf(Function)
    })

    test('Combined Color Algebra', () => {
        const Color = ColorFactory.Merge(Printable)

        const color = new Color()

        expect(color.Red()).toBeInstanceOf(Red)
        expect(color.Red().print()).toBe('#FF0000')
        expect(color.Green()).toBeInstanceOf(Green)
        expect(color.Green().print()).toBe('#00FF00')
        expect(color.Blue()).toBeInstanceOf(Blue)
        expect(color.Blue().print()).toBe('#0000FF')
    })
})