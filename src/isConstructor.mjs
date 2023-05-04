const handler = { construct() { return handler } }

/**
 * Tests if `x` is a constructor.
 * @param {*} x The value to test.
 * @returns {boolean}
 */
export const isConstructor = x => {
    try {
        return !!(new (new Proxy(x, handler))())
    } catch (e) {
        return false
    }
}