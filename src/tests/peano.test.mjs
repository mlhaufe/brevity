import { complect, data, trait } from "../index.mjs";

describe('Peano tests', () => {
    const peanoData = data({ Zero: {}, Succ: { pred: {} } });

    const value = trait(peanoData, {
        Zero(self) { return 0 },
        Succ({ pred }) { return 1 + pred.value() }
    })

    const peano = complect(peanoData, { value }),
        { Zero, Succ } = peano;

    test('Peano data', () => {
        const zero = Zero,
            one = Succ(zero),
            two = Succ(one),
            three = Succ(two);

        expect(zero).toBe(Zero);
        expect(one.pred).toBe(zero);
        expect(two.pred).toBe(one);
        expect(three.pred).toBe(two);
    });

    test('Peano Value trait', () => {
        const zero = Zero,
            one = Succ(zero),
            two = Succ(one),
            three = Succ(two)

        expect(zero.value()).toBe(0)
        expect(one.value()).toBe(1)
        expect(two.value()).toBe(2)
        expect(three.value()).toBe(3)
    })
});