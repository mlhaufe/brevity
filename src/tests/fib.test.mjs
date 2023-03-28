import { Trait, data } from "../index.mjs"

describe('Fibonacci trait', () => {

    test('Wildcard only', () => {
        const fib = Trait(undefined, {
            _: (n) => n == 0 ? 0 :
                n == 1 ? 1 :
                    fib(n - 1) + fib(n - 2)
        })

        expect(fib).toBeDefined()
        expect(fib[data]).toBeUndefined()
        expect(fib(0)).toBe(0)
        expect(fib(1)).toBe(1)
        expect(fib(2)).toBe(1)
        expect(fib(3)).toBe(2)
        expect(fib(4)).toBe(3)
        expect(fib(12)).toBe(144)
    })
})