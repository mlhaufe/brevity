import { Data, isData, variant, Trait } from "../index.mjs";

describe('Shape tests', () => {
    /*
        TODO: how to associate types with the properties?

        type ShapeType = { Circle: [number], Rectangle: [number, number] }
        const Shape = Data<ShapeType>({ Circle: ['radius'], Rectangle: ['width', 'height'] })
    */
    const Shape = Data({ Circle: ['radius'], Rectangle: ['width', 'height'] }),
        { Circle, Rectangle } = Shape;

    test('Shape Data', () => {
        expect(Shape[isData]).toBe(true);

        const circle = Circle({ radius: 1 });
        expect(circle[variant]).toBe(Circle);
        expect(circle).toBeDefined();
        expect(circle.radius).toBe(1);
        // @ts-expect-error
        expect(circle.width).toBeUndefined();
        // @ts-expect-error
        expect(circle.height).toBeUndefined();

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(rectangle[variant]).toBe(Rectangle);
        expect(rectangle).toBeDefined();
        // @ts-expect-error
        expect(rectangle.radius).toBeUndefined();
        expect(rectangle.width).toBe(2);
        expect(rectangle.height).toBe(3);
    })

    const area = Trait(Shape, {
        Circle({ radius }) { return Math.PI * radius * radius },
        Rectangle({ height, width }) { return width * height }
    })

    test('Shape area', () => {
        const circle = Circle({ radius: 1 });
        expect(area(circle)).toBe(Math.PI);

        const rectangle = Rectangle({ width: 2, height: 3 });
        expect(area(rectangle)).toBe(6);
    })
})