import { memoFix, Trait, apply } from '../index.mjs'

describe('least fixed point', () => {
    test('returning bottom on infinite recursion', () => {
        const omega = new Trait(undefined, {
            [apply](x) { return this[apply](x); }
        })

        expect(() => omega('x')).toThrowError(new Error('Maximum call stack size exceeded'));

        const omegaFix = memoFix(omega, 'bottom');

        expect(omegaFix('x')).toBe('bottom');
    })

    test('memo performance', () => {
        const fib = new Trait(undefined, {
            [apply](n) {
                return n < 2 ? n : this[apply](n - 1) + this[apply](n - 2);
            }
        })

        const fibFix = memoFix(fib);

        let start, end;

        start = performance.now();
        fib(30);
        end = performance.now();
        const time = end - start;

        start = performance.now();
        fibFix(30);
        end = performance.now();
        const memoTime = end - start;

        expect(memoTime).toBeLessThan(time);
    })

    test('computed bottom', () => {
        const foo = Trait(undefined, {
            [apply](x) {
                if (x <= 3) {
                    return 1 + this[apply](x + 1);
                } else {
                    return this[apply](x);
                }
            }
        })

        expect(() => foo(1)).toThrowError(new Error('Maximum call stack size exceeded'));

        const fooFix = memoFix(foo, (x: number) => x ** 2)

        expect(fooFix(1)).toBe(19);
        expect(fooFix(2)).toBe(18);
        expect(fooFix(3)).toBe(17);
        expect(fooFix(4)).toBe(16);
    })
})