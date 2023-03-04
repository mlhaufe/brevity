import { Data, isData, variantName } from "../Data.old.mjs";
import { Trait } from "../Trait.mjs";
describe('Shape tests', () => {
    const Shape = Data({ Circle: ['radius'], Rectangle: ['width', 'height'] });
    test('Shape Data', () => {
        expect(Shape[isData]).toBe(true);
        const circle = Shape.Circle({ radius: 1 });
        expect(circle[variantName]).toBe('Circle');
        expect(circle).toBeDefined();
        expect(circle.radius).toBe(1);
        expect(circle.width).toBeUndefined();
        expect(circle.height).toBeUndefined();
        const rectangle = Shape.Rectangle({ width: 2, height: 3 });
        expect(rectangle[variantName]).toBe('Rectangle');
        expect(rectangle).toBeDefined();
        expect(rectangle.radius).toBeUndefined();
        expect(rectangle.width).toBe(2);
        expect(rectangle.height).toBe(3);
    });
    const area = Trait({
        Circle({ radius }) { return Math.PI * radius * radius; },
        Rectangle({ width, height }) { return width * height; }
    });
    test('Shape area', () => {
        const circle = Shape.Circle({ radius: 1 });
        expect(area(circle)).toBe(Math.PI);
        const rectangle = Shape.Rectangle({ width: 2, height: 3 });
        expect(area(rectangle)).toBe(6);
    });
});
//# sourceMappingURL=Shape.test.mjs.map