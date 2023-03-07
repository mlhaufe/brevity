/**
 * Checks if a string is capitalized.
 * @param str The string to check.
 * @returns Returns true if the string is capitalized, else false.
 */
export const isCapitalized = (str: string) => str.match(/^[A-Z][A-Za-z0-9]*$/);