/**
 * Tests if a value satisfies a primitive type.
 * @param {*} value - The value to test.
 * @param {Function} Cons - The primitive type to test.
 * @returns
 */
export const satisfiesPrimitive = (value, Cons) => {
    const typeString = Cons.name.toLowerCase();
    return (typeof value === typeString || value instanceof Cons)
}