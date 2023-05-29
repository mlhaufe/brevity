import { BaseVariant } from "../data.mjs";
import { complect, data, trait } from "../index.mjs"

describe('Color tests', () => {
    const RgbData = data({ Red: {}, Green: {}, Blue: {} });

    const RgbPrintable = trait('print', {
        Red() { return '#FF0000' },
        Green() { return '#00FF00' },
        Blue() { return '#0000FF' }
    })

    test('rgbColor', () => {
        const Color = complect(RgbData, [RgbPrintable]),
            { Red, Green, Blue } = Color();

        expect(Red).toBeDefined();
        expect(Green).toBeDefined();
        expect(Blue).toBeDefined();
        expect(Red).toBeInstanceOf(RgbData[BaseVariant])
        expect(Green).toBeInstanceOf(RgbData[BaseVariant])
        expect(Blue).toBeInstanceOf(RgbData[BaseVariant])

        expect(Red.print()).toBe('#FF0000');
        expect(Green.print()).toBe('#00FF00');
        expect(Blue.print()).toBe('#0000FF');
    })

    const RgbCmykColor = data(RgbData, {
        Cyan: {},
        Magenta: {},
        Yellow: {},
        Black: {}
    });

    const RgbCmykPrintable = trait(RgbPrintable, 'print', {
        Cyan() { return '#00FFFF' },
        Magenta() { return '#FF00FF' },
        Yellow() { return '#FFFF00' },
        Black() { return '#000000' }
    })

    test('CmykColor', () => {
        const Color = complect(RgbCmykColor, [RgbCmykPrintable]),
            { Cyan, Magenta, Yellow, Black, Red, Green, Blue } = Color();

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