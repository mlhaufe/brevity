import { Data, isData, variantName, Trait } from "../index.mjs";

describe('Shape tests', () => {
    const Shape = Data({ Circle: ['radius'], Rectangle: ['width', 'height'] }),
        { Circle, Rectangle } = Shape;

    test('Shape Data', () => {
        expect(Shape[isData]).toBe(true);

        const circle = Circle({ radius: 1 });
        expect(circle[variantName]).toBe('Circle');
        expect(circle).toBeDefined();
        expect(circle.radius).toBe(1);
        // @ts-expect-error
        expect(circle.width).toBeUndefined();
        // @ts-expect-error
        expect(circle.height).toBeUndefined();

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(rectangle[variantName]).toBe('Rectangle');
        expect(rectangle).toBeDefined();
        // @ts-expect-error
        expect(rectangle.radius).toBeUndefined();
        expect(rectangle.width).toBe(2);
        expect(rectangle.height).toBe(3);
    })

    const area = Trait({
        Circle({ radius }) { return Math.PI * radius * radius },
        Rectangle({ width, height }) { return width * height }
    })

    test('Shape area', () => {
        const circle = Circle({ radius: 1 });
        expect(area(circle)).toBe(Math.PI);

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(area(rectangle)).toBe(6);
    })
})