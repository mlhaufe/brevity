import { data, trait } from "../index.mjs";

describe('Peano tests', () => {
    const Peano = data({ Zero: {}, Succ: { pred: {} } });

    test('Peano data', () => {
        const zero = Peano.Zero,
            one = Peano.Succ({ pred: zero }),
            two = Peano.Succ({ pred: one }),
            three = Peano.Succ({ pred: two });

        expect(zero).toBe(Peano.Zero);
        expect(one.pred).toBe(zero);
        expect(two.pred).toBe(one);
        expect(three.pred).toBe(two);
    });

    const value = trait(Peano, {
        Zero(self) { return 0 },
        Succ({ pred }) { return 1 + value(pred) }
    })

    test('Peano Value trait', () => {
        const zero = Peano.Zero,
            one = Peano.Succ({ pred: zero }),
            two = Peano.Succ({ pred: one }),
            three = Peano.Succ({ pred: two })

        expect(value(zero)).toBe(0)
        expect(value(one)).toBe(1)
        expect(value(two)).toBe(2)
        expect(value(three)).toBe(3)
    })
});