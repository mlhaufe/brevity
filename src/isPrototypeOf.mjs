/**
 * Tests if a prototype is in the prototype chain of an object.
 * @param {object} child - The object to test.
 * @param {object} parent - The prototype to test.
 * @returns {boolean}
 */
export const isPrototypeOf = (child, parent) => Object.prototype.isPrototypeOf.call(parent, child)
