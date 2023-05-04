import { complect, data, trait } from "../index.mjs";

describe('Shape tests', () => {
    const shapeData = data({
        Circle: { radius: Number },
        Rectangle: { width: Number, height: Number }
    })

    const area = trait(shapeData, {
        Circle({ radius }) { return Math.PI * radius * radius },
        Rectangle({ width, height }) { return width * height }
    })

    const shape = complect(shapeData, { area }),
        { Circle, Rectangle } = shape;

    test('Shape data', () => {
        const circle = Circle({ radius: 1 });

        expect(circle).toBeDefined();
        expect(circle.radius).toBe(1);
        expect(circle.width).toBeUndefined();
        expect(circle.height).toBeUndefined();

        const rectangle = Rectangle({ width: 2, height: 3 });

        expect(rectangle).toBeDefined();
        expect(rectangle.radius).toBeUndefined();
        expect(rectangle.width).toBe(2);
        expect(rectangle.height).toBe(3);
    })

    test('Shape area', () => {
        const circle = Circle({ radius: 1 });
        expect(circle.area()).toBe(Math.PI);

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(rectangle.area()).toBe(6);
    })

    test('Trait with missing variant', () => {
        expect(() => {
            const toString = trait(shapeData, {})
        }).toThrow("Invalid Trait declaration. Missing definition for 'Circle'")
    })
})