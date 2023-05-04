import { complect, data, extend, trait } from "../index.mjs"

describe('Color tests', () => {
    const rgbData = data({ Red: {}, Green: {}, Blue: {} });

    test('rgbData', () => {
        expect(rgbData).toBeDefined();
        expect(rgbData.Red).toBeDefined();
        expect(rgbData.Green).toBeDefined();
        expect(rgbData.Blue).toBeDefined();

        const { Red, Green, Blue } = rgbData;

        expect(Red).toEqual({});
        expect(Green).toEqual({});
        expect(Blue).toEqual({});
    })

    const rgbPrintable = trait(rgbData, {
        Red() { return '#FF0000' },
        Green() { return '#00FF00' },
        Blue() { return '#0000FF' }
    })

    test('rgbPrintable', () => {
        const { Red, Green, Blue } = rgbData;

        expect(rgbPrintable).toBeDefined();
        expect(rgbPrintable(Red)).toBe('#FF0000');
        expect(rgbPrintable(Green)).toBe('#00FF00');
        expect(rgbPrintable(Blue)).toBe('#0000FF');
    })

    test('rgbColor', () => {
        const color = complect(rgbData, { print: rgbPrintable }),
            { Red, Green, Blue } = color;

        expect(Red).toBeDefined();
        expect(Green).toBeDefined();
        expect(Blue).toBeDefined();
        expect(Red.print()).toBe('#FF0000');
        expect(Green.print()).toBe('#00FF00');
        expect(Blue.print()).toBe('#0000FF');
    })

    const rgbCmykColor = data({
        [extend]: rgbData,
        Cyan: {},
        Magenta: {},
        Yellow: {},
        Black: {}
    });

    const rgbCmykPrintable = trait(rgbCmykColor, {
        [extend]: rgbPrintable,
        Cyan() { return '#00FFFF' },
        Magenta() { return '#FF00FF' },
        Yellow() { return '#FFFF00' },
        Black() { return '#000000' }
    })

    test('CmykColor', () => {
        const color = complect(rgbCmykColor, { print: rgbCmykPrintable });
        const { Cyan, Magenta, Yellow, Black, Red, Green, Blue } = color;

        expect(Cyan).toBeDefined();
        expect(Magenta).toBeDefined();
        expect(Yellow).toBeDefined();
        expect(Black).toBeDefined();
        expect(Red).toBeDefined();
        expect(Green).toBeDefined();
        expect(Blue).toBeDefined();
        expect(Cyan.print()).toBe('#00FFFF');
        expect(Magenta.print()).toBe('#FF00FF');
        expect(Yellow.print()).toBe('#FFFF00');
        expect(Black.print()).toBe('#000000');
        expect(Red.print()).toBe('#FF0000');
        expect(Green.print()).toBe('#00FF00');
        expect(Blue.print()).toBe('#0000FF');
    })
})