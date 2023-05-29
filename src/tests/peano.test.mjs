import { BaseVariant } from "../data.mjs";
import { complect, data, trait } from "../index.mjs";

describe('Peano tests', () => {
    const PeanoData = data(() => ({
        Zero: {},
        Succ: { pred: PeanoData }
    }));

    test('Peano data', () => {
        const Peano = PeanoData(),
            { Zero, Succ } = Peano

        const zero = Zero,
            one = Succ(zero),
            two = Succ(one);

        expect(zero).toBe(Zero);
        expect(one.pred).toBe(zero);
        expect(two.pred).toBe(one);

        expect(zero).toBeInstanceOf(PeanoData[BaseVariant])
        expect(one).toBeInstanceOf(PeanoData[BaseVariant])

        expect(() => Succ(1)).toThrow();
    })

    test('Guard test', () => {
        const Peano = complect(PeanoData)(),
            { Zero, Succ } = Peano;

        expect(Zero).toBeDefined();
        expect(Succ).toBeDefined();

        const z = Zero,
            one = Succ(z),
            two = Succ(one)

        expect(z).toBeDefined();
        expect(one).toBeDefined();
        expect(two).toBeDefined();
        expect(z).toBeInstanceOf(PeanoData[BaseVariant])
        expect(one).toBeInstanceOf(PeanoData[BaseVariant])

        expect(z.pred).toBeUndefined();
        expect(one.pred).toBe(z);
        expect(two.pred).toBe(one);

        expect(() => Succ(1)).toThrow();
    })

    const ValueTrait = trait('value', {
        Zero(self) { return 0 },
        Succ({ pred }) { return 1 + pred.value() }
    })

    const Peano = complect(PeanoData, [ValueTrait]),
        { Zero, Succ } = Peano();

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