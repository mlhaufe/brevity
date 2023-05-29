import { complect, data } from "../index.mjs"

describe('Getter field tests', () => {
    test('data with computed property names', () => {
        const EmployeeData = data({
            Employee: { firstName: {}, lastName: {}, fullName: {} }
        })

        const { Employee } = complect(EmployeeData)()

        const p = Employee({
            firstName: 'John',
            lastName: 'Doe',
            fullName: () => `${p.firstName} ${p.lastName}`
        })

        expect(p.fullName).toBe('John Doe')
    })

    test('data with self-referential computed property names', () => {
        const LangData = data({
            Alt: { left: {}, right: {} },
            Cat: { first: {}, second: {} },
            Char: { value: {} },
            Empty: {},
        }),
            { Alt, Empty, Cat, Char } = complect(LangData)()

        // balanced parentheses grammar
        // S = S ( S ) ∪ ε
        const S = Alt(Cat(() => S, Cat(Char('('), Cat(() => S, Char(')')))), Empty)

        expect(S).toBeDefined()
        expect(S.left).toBeDefined()
        expect(S.left.first).toBeDefined()
        expect(S.left.first).toBe(S)
        expect(S.right).toBeDefined()
    })
})