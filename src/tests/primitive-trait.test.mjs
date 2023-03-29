import { Trait, data } from "../Trait.mjs"

describe('Primitive traits', () => {
    test('Number trait', () => {
        const printNumber = Trait(Number, {
            1: () => 'one',
            15: () => 'fifteen',
            [Infinity]: () => 'infinity',
            [Number.EPSILON]: () => 'epsilon',
            [Number.MAX_SAFE_INTEGER]: () => 'max safe integer',
            [Number.MAX_VALUE]: () => 'max value',
            [Number.MIN_VALUE]: () => 'min value',
            [Number.NaN]: () => 'not a number',
            [NaN]: () => 'not a number',
            [Number.POSITIVE_INFINITY]: () => 'positive infinity',
            [Number.NEGATIVE_INFINITY]: () => 'negative infinity',
            _: (n) => n.toString()
        })

        expect(printNumber).toBeDefined()
        expect(printNumber[data]).toBe(Number)
        expect(printNumber(1)).toBe('one')
        expect(printNumber(15)).toBe('fifteen')
        expect(printNumber(Infinity)).toBe('positive infinity')
        expect(printNumber(Number.EPSILON)).toBe('epsilon')
        expect(printNumber(Number.MAX_SAFE_INTEGER)).toBe('max safe integer')
        expect(printNumber(Number.MAX_VALUE)).toBe('max value')
        expect(printNumber(Number.MIN_VALUE)).toBe('min value')
        expect(printNumber(Number.NaN)).toBe('not a number')
        expect(printNumber(NaN)).toBe('not a number')
        expect(printNumber(Number.POSITIVE_INFINITY)).toBe('positive infinity')
        expect(printNumber(Number.NEGATIVE_INFINITY)).toBe('negative infinity')
        expect(printNumber(0)).toBe('0')
        expect(printNumber(123)).toBe('123')

        expect(() => printNumber('hello')).toThrow()
    })

    test('String trait', () => {
        const printString = Trait(String, {
            '': () => 'empty string',
            'hello': (s) => s,
            _: (s) => s
        })

        expect(printString).toBeDefined()
        expect(printString[data]).toBe(String)
        expect(printString('')).toBe('empty string')
        expect(printString('hello')).toBe('hello')

        expect(() => printString(2)).toThrow()
    })

    test('Boolean trait', () => {
        const printBoolean = Trait(Boolean, {
            true: () => 'true',
            false: () => 'false'
        })

        expect(printBoolean).toBeDefined()
        expect(printBoolean[data]).toBe(Boolean)
        expect(printBoolean(true)).toBe('true')
        expect(printBoolean(false)).toBe('false')

        expect(() => printBoolean(NaN)).toThrow()
    })

    test('BigInt trait', () => {
        const printBigInt = Trait(BigInt, {
            '0n': () => 'zero',
            '1n': () => 'one',
            '1234567890123456789012345678901234567890n': () => 'a big number',
            _: (n) => n.toString()
        })

        expect(printBigInt).toBeDefined()
        expect(printBigInt[data]).toBe(BigInt)
        expect(printBigInt(0n)).toBe('zero')
        expect(printBigInt(1n)).toBe('one')
        expect(printBigInt(1234567890123456789012345678901234567890n)).toBe('a big number')

        expect(() => printBigInt(1)).toThrow()
    })
})