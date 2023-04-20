import { trait, apply } from "../index.mjs"

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
        expect(printNumber[apply](1)).toBe('one')
        expect(printNumber[apply](15)).toBe('fifteen')
        expect(printNumber[apply](Infinity)).toBe('positive infinity')
        expect(printNumber[apply](Number.EPSILON)).toBe('epsilon')
        expect(printNumber[apply](Number.MAX_SAFE_INTEGER)).toBe('max safe integer')
        expect(printNumber[apply](Number.MAX_VALUE)).toBe('max value')
        expect(printNumber[apply](Number.MIN_VALUE)).toBe('min value')
        expect(printNumber[apply](Number.NaN)).toBe('not a number')
        expect(printNumber[apply](NaN)).toBe('not a number')
        expect(printNumber[apply](Number.POSITIVE_INFINITY)).toBe('positive infinity')
        expect(printNumber[apply](Number.NEGATIVE_INFINITY)).toBe('negative infinity')
        expect(printNumber[apply](0)).toBe('0')
        expect(printNumber[apply](123)).toBe('123')

        expect(() => printNumber[apply]('hello')).toThrow()
    })

    test('String trait', () => {
        const printString = trait(String, {
            '': (s) => 'empty string',
            'hello': (s) => s,
            _: (s) => s
        })

        expect(printString).toBeDefined()
        expect(printString[apply]('')).toBe('empty string')
        expect(printString[apply]('hello')).toBe('hello')

        expect(() => printString[apply](2)).toThrow()
    })

    test('Boolean trait', () => {
        const printBoolean = trait(Boolean, {
            true: () => 'true',
            false: () => 'false'
        })

        expect(printBoolean).toBeDefined()
        expect(printBoolean[apply](true)).toBe('true')
        expect(printBoolean[apply](false)).toBe('false')

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
        expect(printBigInt[apply](0n)).toBe('zero')
        expect(printBigInt[apply](1n)).toBe('one')
        expect(printBigInt[apply](1234567890123456789012345678901234567890n)).toBe('a big number')

        expect(() => printBigInt[apply](1)).toThrow()
    })
})