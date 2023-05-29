import { complect, data, trait } from "../index.mjs";

describe('Shape tests', () => {
    const ShapeData = data({
        Circle: { radius: Number },
        Rectangle: { width: Number, height: Number }
    })

    const Areable = trait('area', {
        Circle({ radius }) { return Math.PI * radius * radius },
        Rectangle({ width, height }) { return width * height }
    })

    const Shape = complect(ShapeData, [Areable]),
        { Circle, Rectangle } = Shape();

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
})