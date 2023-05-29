import { complect, data, trait, _, Pattern } from "../index.mjs"

describe('Fibonacci trait', () => {
    const FibData = data({
        Fib: { n: Number }
    })

    const Evaluable = trait('evaluate', {
        Fib({ n }) {
            return n === 0 ? 0 :
                n === 1 ? 1 :
                    this.Fib(n - 1).evaluate() + this.Fib(n - 2).evaluate()
        }
    })

    const PatternEvaluable = trait('evalPattern', {
        Fib: Pattern(($) => [
            [{ n: 0 }, (self) => 0],
            [{ n: 1 }, (self) => 1],
            [_, ({ n }) => $.Fib(n - 1).evalPattern() + $.Fib(n - 2).evalPattern()]
        ])
    })

    const { Fib } = complect(FibData, [Evaluable, PatternEvaluable])()

    test('Wildcard only', () => {
        expect(Fib).toBeDefined()
        expect(Fib(0).evaluate()).toBe(0)
        expect(Fib(1).evaluate()).toBe(1)
        expect(Fib(2).evaluate()).toBe(1)
        expect(Fib(3).evaluate()).toBe(2)
        expect(Fib(4).evaluate()).toBe(3)
        expect(Fib(12).evaluate()).toBe(144)
    })

    test('Specific', () => {
        expect(Fib).toBeDefined()
        expect(Fib(0).evalPattern()).toBe(0)
        expect(Fib(1).evalPattern()).toBe(1)
        expect(Fib(2).evalPattern()).toBe(1)
        expect(Fib(3).evalPattern()).toBe(2)
        expect(Fib(4).evalPattern()).toBe(3)
        expect(Fib(12).evalPattern()).toBe(144)
    })
})