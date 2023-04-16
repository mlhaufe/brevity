import { data, isData, variant, variantName, trait } from "../index.mjs";

describe('Shape tests', () => {
    const Shape = data({
        Circle: { radius: {} },
        Rectangle: { width: {}, height: {} }
    }),
        { Circle, Rectangle } = Shape;

    test('Shape data', () => {
        expect(Shape[isData]).toBe(true);

        const circle = Circle({ radius: 1 });
        expect(circle[variant]).toBe(Circle);
        expect(circle[variantName]).toBe('Circle');
        expect(circle).toBeDefined();
        expect(circle.radius).toBe(1);
        expect(circle.width).toBeUndefined();
        expect(circle.height).toBeUndefined();

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(rectangle[variant]).toBe(Rectangle);
        expect(rectangle[variantName]).toBe('Rectangle');
        expect(rectangle).toBeDefined();
        expect(rectangle.radius).toBeUndefined();
        expect(rectangle.width).toBe(2);
        expect(rectangle.height).toBe(3);
    })

    const area = trait(Shape, {
        Circle({ radius }) { return Math.PI * radius * radius },
        Rectangle({ width, height }) { return width * height }
    })

    test('Shape area', () => {
        const circle = Circle({ radius: 1 });
        expect(area(circle)).toBe(Math.PI);

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(area(rectangle)).toBe(6);
    })

    test('Trait with missing variant', () => {
        expect(() => {
            const toString = trait(Shape, {})
        }).toThrow("Invalid trait declaration. Missing definition for 'Circle'")
    })
})