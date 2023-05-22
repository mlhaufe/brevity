import { complect, data, memoFix, trait } from '../index.mjs'

describe('least fixed point', () => {
    test('returning bottom on infinite recursion', () => {
        const numData = data({
            Num: { n: Number }
        })

        const OmegaTrait = trait('omega', {
            Num({ n }) { return this.Num(n).omega(); }
        })

        const OmegaFixTrait = trait('omegaFix', {
            [memoFix]: { bottom: 'bottom' },
            Num({ n }) { return this.Num(n).omegaFix(); }
        })

        const { Num } = complect(numData, [OmegaTrait, OmegaFixTrait])

        expect(() =>
            Num(2).omega()
        ).toThrowError(new Error('Maximum call stack size exceeded'));

        expect(Num(2).omegaFix()).toBe('bottom');
    })

    test('memo performance', () => {
        const fibData = data({
            Fib: { n: Number }
        })

        const Evaluable = trait('evaluate', {
            Fib({ n }) {
                return n < 2 ? n : this.Fib(n - 1).evaluate() + this.Fib(n - 2).evaluate();
            }
        })

        const FixEvalTrait = trait('fixEval', {
            [memoFix]: { bottom: 0 },
            Fib({ n }) {
                return n < 2 ? n : this.Fib(n - 1).fixEval() + this.Fib(n - 2).fixEval();
            }
        })

        const { Fib } = complect(fibData, [Evaluable, FixEvalTrait])

        let start, end;

        start = performance.now();
        Fib(30).evaluate();
        end = performance.now();
        const time = end - start;

        start = performance.now();
        Fib(30).fixEval();
        end = performance.now();
        const memoTime = end - start;

        expect(memoTime).toBeLessThan(time);
    })

    test('computed bottom', () => {
        const fooData = data({
            Foo: { n: Number }
        })

        const FooTrait = trait('foo', {
            Foo({ n }) {
                if (n <= 3)
                    return 1 + this.Foo(n + 1).foo();
                else
                    return this.Foo(n).foo();
            }
        })
        const { Foo } = complect(fooData, [FooTrait])

        expect(() => Foo(1).foo()).toThrowError(new Error('Maximum call stack size exceeded'));

        const FooFixTrait = trait('foo', {
            [memoFix]: { bottom: ({ n }) => n ** 2 },
            Foo({ n }) {
                if (n <= 3)
                    return 1 + this.Foo(n + 1).foo();
                else
                    return this.Foo(n).foo();
            }
        })

        const { Foo: FooFix } = complect(fooData, [FooFixTrait])

        expect(FooFix(1).foo()).toBe(19);
        expect(FooFix(2).foo()).toBe(18);
        expect(FooFix(3).foo()).toBe(17);
        expect(FooFix(4).foo()).toBe(16);
    })
})