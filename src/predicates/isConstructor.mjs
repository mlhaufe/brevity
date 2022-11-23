export const isConstructor = (object) => {
    if (typeof object != 'function')
        return false
    let P = new Proxy(object, { construct() { return this; } });
    try { return Boolean(new P()); } catch (e) { return false; }
}