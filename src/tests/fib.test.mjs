import { trait, apply } from "../index.mjs"

describe('Fibonacci trait', () => {

    test('Wildcard only', () => {
        const fib = trait(Number, () => ({
            _: (n) => n == 0 ? 0 :
                n == 1 ? 1 :
                    fib[apply](n - 1) + fib[apply](n - 2)
        }))

        expect(fib).toBeDefined()
        expect(fib[apply](0)).toBe(0)
        expect(fib[apply](1)).toBe(1)
        expect(fib[apply](2)).toBe(1)
        expect(fib[apply](3)).toBe(2)
        expect(fib[apply](4)).toBe(3)
        expect(fib[apply](12)).toBe(144)
    })

    test('Specific', () => {
        const fib = trait(Number, () => ({
            0: (n) => 0,
            1: (n) => 1,
            _: (n) => fib[apply](n - 1) + fib[apply](n - 2)
        }))

        expect(fib).toBeDefined()
        expect(fib[apply](0)).toBe(0)
        expect(fib[apply](1)).toBe(1)
        expect(fib[apply](2)).toBe(1)
        expect(fib[apply](3)).toBe(2)
        expect(fib[apply](4)).toBe(3)
        expect(fib[apply](12)).toBe(144)
    })
})