/**
 * Asserts that a condition is true. If not, throws an error with the given message.
 * @param condition The condition to assert.
 * @param message The error message.
 */
export const assert = (condition: unknown, message: string): asserts condition => {
    if (Boolean(condition) === false) {
        throw new Error(message);
    }
}