/**
 * Determines whether the given string is camel case.
 * @param str The string to check.
 * @returns Returns true if the string is camel case, else false.
 */
export const isCamelCase = (str: string) => str.match(/^[a-z][A-Za-z0-9]*$/);