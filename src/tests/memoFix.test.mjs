import { extend, memoFix, trait } from '../index.mjs'

describe('least fixed point', () => {
    test('returning bottom on infinite recursion', () => {
        const omega = trait(Number, {
            _(x) { return this._(x); }
        })

        expect(() =>
            omega(2)
        ).toThrowError(new Error('Maximum call stack size exceeded'));

        const omegaFix = trait(Number, {
            [extend]: omega,
            [memoFix]: { bottom: 'bottom' }
        })

        expect(omegaFix(2)).toBe('bottom');
    })

    test('memo performance', () => {
        const fib = trait(Number, {
            _(n) {
                return n < 2 ? n : this._(n - 1) + this._(n - 2);
            }
        })

        const fibFix = trait(Number, {
            [extend]: fib,
            [memoFix]: { bottom: 0 },
        })

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
        const foo = trait(Number, {
            _(x) {
                if (x <= 3) {
                    return 1 + this._(x + 1);
                } else {
                    return this._(x);
                }
            }
        })

        expect(() => foo(1)).toThrowError(new Error('Maximum call stack size exceeded'));

        const fooFix = trait(Number, {
            [extend]: foo,
            [memoFix]: { bottom: (x) => x ** 2 }
        })

        expect(fooFix(1)).toBe(19);
        expect(fooFix(2)).toBe(18);
        expect(fooFix(3)).toBe(17);
        expect(fooFix(4)).toBe(16);
    })
})