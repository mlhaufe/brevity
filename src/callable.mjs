/**
 * Make a class callable
 * @param {new (...args: any[]) => any} Clazz
 * @returns {(...args: any[]) => any} - The callable class
 */
export function callable(Clazz) {
    function Create(...args) {
        return new Clazz(...args);
    }
    Object.setPrototypeOf(Create, Clazz);
    Object.defineProperty(Create, 'name', { value: Clazz.name });
    Object.setPrototypeOf(Create.prototype, Clazz.prototype);
    return Create;
}