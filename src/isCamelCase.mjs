/**
 * Tests if the given string is camelCase
 * @param {string} str - The string to test
 * @returns {boolean} - True if the string is a valid identifier
 */
export const isCamelCase = str => /^[a-z][A-Za-z0-9]*/.test(str);
