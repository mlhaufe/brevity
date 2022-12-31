// tests if a value is an object literal
const isObjectLiteral = obj => obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
// tests if a string is capitalized
const isCapitalized = str => typeof str === 'string' && str.match(/^[A-Z][A-Za-z0-9]*$/);
// tests if a string is camelCase
const isCamelCase = str => typeof str === 'string' && str.match(/^[a-z][A-Za-z0-9]*$/);

function def(variants) {
    if (!isObjectLiteral(variants))
        throw new TypeError('variants declaration must be an object literal');

    for (const [name, params] of Object.entries(variants)) {
        if (!isCapitalized(name))
            throw new TypeError(`variant name must be capitalized: ${name}`);
        if (!Array.isArray(params))
            throw new TypeError(`variant properties must be an array: ${name}`);
        if (!params.every(isCamelCase))
            throw new TypeError(`variant properties must be camelCase strings: ${name}: ${params}`);
        if (new Set(params).size !== params.length) {
            throw new TypeError(`type parameters must be unique: ${name}: ${params}`);
        }
        // if the type has no parameters, it is a singleton
        if (params.length === 0) {
            variants[name] = Object.freeze(
                Object.assign(Object.create(null), ({ [typeName]: name, [isSingleton]: true }))
            )
        } else {
            // otherwise each type becomes a constructor
            variants[name] = function (...args) {
                const obj = Object.create(variants[name].prototype);

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
                } else if (args.length === params.length) {
                    args.forEach((arg, i) => {
                        if (typeof arg === 'function')
                            Object.defineProperty(obj, params[i], { get: arg, enumerable: true });
                        else
                            obj[params[i]] = arg;
                    })
                } else {
                    throw new TypeError(`wrong number of parameters: ${name}: ${params}`);
                }

                return Object.freeze(obj);
            }
            variants[name].prototype = Object.freeze({ [typeName]: name, [isSingleton]: false });
        }
    }
    // each type is tagged with a symbol
    variants[isData] = true;
    // the type declaration is immutable
    return Object.freeze(variants);
}

export const typeName = Symbol('typeName'),
    isData = Symbol('isData'),
    isSingleton = Symbol('isSingleton');

/**
 * Data types with named parameters and immutable objects.
 * @param {Object} variants
 * @returns {Object}
 * @example
 * const Color = Data({ Red: [], Green: [], Blue: [] }),
 *       red = Color.Red;
 *
 * const Point = Data({ Point2: ['x', 'y'], Point3: ['x', 'y', 'z'] }),
 *       p2 = Point.Point2({ x: 1, y: 2 }),
 *       p3 = Point.Point3({ x: 1, y: 2, z: 3 });
 *
 * const List = Data({ Nil: [], Cons: ['head', 'tail'] }),
 *       list = List.Cons({ head: 1, tail: List.Cons({ head: 2, tail: List.Nil }) });

 * const Peano = Data({ Zero: [], Succ: ['pred'] }),
 *       zero = Peano.Zero,
 *       succ = Peano.Succ({ pred: Peano.Zero });
 * 
 * const ExtendedColor = Data(Color, { Yellow: [], Magenta: [], Cyan: [] }),
 *      red = ExtendedColor.Red,
 *      yellow = ExtendedColor.Yellow;
 */
export function Data(Base, variants) {
    let data
    if (Base && variants) {
        if (!Base[isData])
            throw new TypeError('Base must be a Data type');
        data = Object.assign({}, Base, def(variants));
    }
    else if (Base && !variants) {
        data = def(Base);
    }
    else {
        throw new TypeError('Data requires at least one argument');
    }

    return Object.freeze(data);
}

