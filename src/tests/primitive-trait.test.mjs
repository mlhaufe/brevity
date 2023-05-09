import { trait } from "../index.mjs"

describe('Primitive traits', () => {
    test('Number trait', () => {
        const printNumber = trait(Number, {
            1: (n) => 'one',
            15: (n) => 'fifteen',
            [Infinity]: (n) => 'infinity',
            [Number.EPSILON]: (n) => 'epsilon',
            [Number.MAX_SAFE_INTEGER]: (n) => 'max safe integer',
            [Number.MAX_VALUE]: (n) => 'max value',
            [Number.MIN_VALUE]: (n) => 'min value',
            [Number.NaN]: (n) => 'not a number',
            [NaN]: (n) => 'not a number',
            [Number.POSITIVE_INFINITY]: (n) => 'positive infinity',
            [Number.NEGATIVE_INFINITY]: (n) => 'negative infinity',
            _: (n) => n.toString()
        })

        expect(printNumber).toBeDefined()
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

        // TODO: revisit this if/when trait signatures are introduced.
        // Don't want to put in guard checking just for the first argument and ignore the rest...
        // expect(() => printNumber('hello')).toThrow()
    })

    test('String trait', () => {
        const printString = trait(String, {
            '': (s) => 'empty string',
            'hello': (s) => s,
            _: (s) => s
        })

        expect(printString).toBeDefined()
        expect(printString('')).toBe('empty string')
        expect(printString('hello')).toBe('hello')

        // TODO: revisit this if/when trait signatures are introduced.
        // Don't want to put in guard checking just for the first argument and ignore the rest...
        // expect(() => printString(2)).toThrow()
    })

    test('Boolean trait', () => {
        const printBoolean = trait(Boolean, {
            true: () => 'true',
            false: () => 'false'
        })

        expect(printBoolean).toBeDefined()
        expect(printBoolean(true)).toBe('true')
        expect(printBoolean(false)).toBe('false')

        expect(() => printBoolean(NaN)).toThrow()
    })

    test('BigInt trait', () => {
        const printBigInt = trait(BigInt, {
            '0n': (n) => 'zero',
            '1n': (n) => 'one',
            '1234567890123456789012345678901234567890n': (n) => 'a big number',
            _: (n) => n.toString()
        })

        expect(printBigInt).toBeDefined()
        expect(printBigInt(0n)).toBe('zero')
        expect(printBigInt(1n)).toBe('one')
        expect(printBigInt(1234567890123456789012345678901234567890n)).toBe('a big number')

        // TODO: revisit this if/when trait signatures are introduced.
        // Don't want to put in guard checking just for the first argument and ignore the rest...
        // expect(() => printBigInt(1)).toThrow()
    })
})