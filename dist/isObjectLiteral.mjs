export const isObjectLiteral = (obj) => {
    if (typeof obj !== 'object' || obj === null)
        return false;
    const proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
};
//# sourceMappingURL=isObjectLiteral.mjs.map