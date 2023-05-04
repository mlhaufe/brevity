/**
 * Tests if the given string is capitalized
 * @param {string} str - The string to test
 * @returns {boolean} - True if the string is a valid identifier
 */
export const isCapitalized = str => /^[A-Z][A-Za-z0-9]*/.test(str);
