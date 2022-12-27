function _def(types) {
    const typeDef = Object.create(null);
    for (const [name, params] of Object.entries(types)) {
        if (typeof name !== 'string' || !name.match(/^[A-Z][A-Za-z0-9]*$/))
            throw new TypeError(`Name must be capitalized: ${name}`);
        if (!Array.isArray(params) || params.some(param => typeof param !== 'string' || !param.match(/^[a-z][A-Za-z0-9]*$/)))
            throw new TypeError(`Properties must be camelCase strings: ${name}`);
        if (new Set(params).size !== params.length)
            throw new TypeError(`type parameters must be unique: ${name}`);
        // if the type has no parameters, it is a singleton
        if (params.length === 0) {
            typeDef[name] = Object.freeze({ name, [isSingleton]: true });
        }
        else {
            // otherwise each type becomes a constructor with named parameters
            typeDef[name] = function (args) {
                const obj = Object.create(types[name].prototype);
                // every parameter must be in the args
                for (const param of params) {
                    if (!(param in args)) {
                        throw new TypeError(`missing parameter: ${param}`);
                    }
                }
                Object.assign(obj, args);
                // each type is immutable
                return Object.freeze(obj);
            };
            typeDef[name][isSingleton] = false;
        }
    }
    return Object.freeze(typeDef);
}
export const isData = Symbol('isData'), isSingleton = Symbol('isSingleton');
export function Data(Base, types) {
    let data;
    if (Base && types)
        data = Object.assign({}, Base, _def(types));
    else
        data = _def(Base);
    data[isData] = true;
    return Object.freeze(data);
}
