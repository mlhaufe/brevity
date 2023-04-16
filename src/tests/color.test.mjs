import { data, isData, dataDecl, variant, variantName, trait } from "../index.mjs"

describe('Color tests', () => {
    const Color = data({ Red: {}, Green: {}, Blue: {} });

    test('Color data', () => {
        expect(Color[isData]).toBe(true);
        const red = Color.Red;
        expect(red).toBeDefined();
        expect(red[variant]).toBe(red);
        expect(red[variantName]).toBe('Red');
        expect(red.Red).toBeUndefined();
    })

    const print = trait(Color, {
        Red() { return '#FF0000' },
        Green() { return '#00FF00' },
        Blue() { return '#0000FF' }
    })

    test('Color print', () => {
        expect(print[dataDecl]).toBe(Color);

        expect(print(Color.Red)).toBe('#FF0000');
        expect(print(Color.Green)).toBe('#00FF00');
        expect(print(Color.Blue)).toBe('#0000FF');
    })
})