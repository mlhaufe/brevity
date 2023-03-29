import { Data, variant, variantName } from "../index.mjs"

describe('Getter field tests', () => {
    test('Data with computed property names', () => {
        const Employee = Data(['firstName', 'lastName', 'fullName'])

        const p = Employee({
            firstName: 'John',
            lastName: 'Doe',
            fullName: () => `${p.firstName} ${p.lastName}`
        })

        expect(p.fullName).toBe('John Doe')
    })

    test('Data with self-referential computed property names', () => {
        const Lang = Data({
            Alt: ['left', 'right'],
            Cat: ['first', 'second'],
            Char: ['value'],
            Empty: [],
        }),
            { Alt, Empty, Cat, Char } = Lang

        // balanced parentheses grammar
        // S = S ( S ) ∪ ε
        const S = Alt(Cat(() => S, Cat(Char('('), Cat(() => S, Char(')')))), Empty)

        expect(S).toBeDefined()
        expect(S[variant]).toBe(Alt)
        expect(S[variantName]).toBe('Alt')
        expect(S.left).toBeDefined()
        expect(S.left[variant]).toBe(Cat)
        expect(S.left[variantName]).toBe('Cat')

        expect(S.left.first).toBeDefined()
        expect(S.left.first).toBe(S)
        expect(S.left.first[variant]).toBe(Alt)
        expect(S.left.first[variantName]).toBe('Alt')

        expect(S.right).toBeDefined()
        expect(S.right[variant]).toBe(Empty)
        expect(S.right[variantName]).toBe('Empty')
    })
})