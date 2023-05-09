const typeofList = ['boolean', 'bigint', 'number', 'string', 'symbol', 'undefined']

export const isPrimitive = (p) => {
    return p === null || typeofList.includes(typeof p);
};
