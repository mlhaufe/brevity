/**
 * Checks if the value is an object literal.
 * @param value The value to check.
 * @returns Returns true if the value is an object literal, else false.
 */
export const isObjectLiteral = (value: any) => value !== null && Object.getPrototypeOf(value) === Object.prototype;