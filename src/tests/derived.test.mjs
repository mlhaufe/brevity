import { data } from "../index.mjs"

describe('Derived field tests', () => {
    test('Employee with derived field', () => {
        const { Employee } = data({
            Employee: {
                firstName: String,
                lastName: String,
                fullName: {
                    guard: String,
                    get() { return `${this.firstName} ${this.lastName}` }
                }
            }
        })

        const johnDoe = Employee({
            firstName: 'John',
            lastName: 'Doe'
        })

        expect(johnDoe.fullName).toBe('John Doe')

        expect(() => {
            Employee({
                firstName: 'Jane',
                lastName: 'Doe',
                fullName: 'Jane Doe'
            })
        }).toThrow()
    })

    test('Bad derived field', () => {
        const { Employee } = data({
            Employee: {
                firstName: String,
                lastName: String,
                fullName: {
                    guard: String,
                    get() { return 12 }
                }
            }
        })

        const johnDoe = Employee({
            firstName: 'John',
            lastName: 'Doe'
        })
        expect(() => johnDoe.fullName).toThrow()
    })
})