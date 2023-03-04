import { isObjectLiteral } from "./isObjectLiteral.mjs";
export const isData = Symbol('isData'), isSingleton = Symbol('isSingleton'), variantName = Symbol('variantName');
function def(variants) {
    const result = Object.create(null);
    for (const [name, params] of Object.entries(variants)) {
        if (new Set(params).size !== params.length) {
            throw new TypeError(`type parameters must be unique: ${name}: ${params}`);
        }
        // if the type has no parameters, it is a singleton
        if (params.length === 0) {
            Object.assign(result, {
                [name]: Object.freeze({ [variantName]: name, [isSingleton]: true })
            });
        }
        else {
            // otherwise each type becomes a constructor
            result[name] = function (...args) {
                const obj = Object.create(result[name].prototype);
                const objArg = args[0];
                if (args.length === 1 && isObjectLiteral(objArg)) {
                    if (Object.keys(objArg).length > params.length)
                        throw new TypeError(`too many parameters. expected: ${name}: ${params}, got: ${name}: ${Object.keys(objArg)}`);
                    for (const param of params) {
                        if (!(param in objArg))
                            throw new TypeError(`missing parameter: ${param}`);
                        if (typeof objArg[param] === 'function')
                            Object.defineProperty(obj, param, { get: objArg[param], enumerable: true });
                        else
                            obj[param] = objArg[param];
                    }
                }
                else if (args.length === params.length) {
                    args.forEach((arg, i) => {
                        if (typeof arg === 'function')
                            Object.defineProperty(obj, params[i], { get: arg, enumerable: true });
                        else
                            obj[params[i]] = arg;
                    });
                }
                else {
                    throw new TypeError(`wrong number of parameters: ${name}: ${params}`);
                }
                return Object.seal(obj);
            };
            result[name].prototype = Object.freeze({ [variantName]: name, [isSingleton]: false });
        }
    }
    Object.assign(result, { [isData]: true });
    return Object.freeze(result);
}
export function Data(Base, variants) {
    let data;
    if (Base && variants) {
        if (!Base[isData])
            throw new TypeError('Base must be a Data type');
        data = Object.assign(Object.create(null), Base, def(variants));
    }
    else if (Base && !variants) {
        data = def(Base);
    }
    else {
        throw new TypeError('Data requires at least one argument');
    }
    return Object.freeze(data);
}
//# sourceMappingURL=Data.mjs.map