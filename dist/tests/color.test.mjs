import { Data, isData, variantName, Trait } from "../index.mjs";
describe('Color tests', () => {
    const Color = Data({ Red: [], Green: [], Blue: [] });
    test('Color Data', () => {
        expect(Color[isData]).toBe(true);
        const red = Color.Red;
        expect(red).toBeDefined();
        expect(red[variantName]).toBe('Red');
        expect(red.Red).toBeUndefined();
    });
    const print = Trait({
        Red() { return '#FF0000'; },
        Green() { return '#00FF00'; },
        Blue() { return '#0000FF'; }
    });
    test('Color print', () => {
        expect(print(Color.Red)).toBe('#FF0000');
        expect(print(Color.Green)).toBe('#00FF00');
        expect(print(Color.Blue)).toBe('#0000FF');
    });
});
//# sourceMappingURL=color.test.mjs.map