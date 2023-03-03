import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";

const isObjectLiteral = obj => obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
const isCapitalized = str => typeof str === 'string' && str.match(/^[A-Z][A-Za-z0-9]*$/);
const isCamelCase = str => typeof str === 'string' && str.match(/^[a-z][A-Za-z0-9]*$/);

const pool = Symbol('pool');

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
                Object.assign(Object.create(null), ({ [variantName]: name, [isSingleton]: true }))
            )
        } else {
            // otherwise each type becomes a constructor
            const self = variants[name] = function (...args) {
                const normalizedArgs = [];

                if (params.length === 1) {
                    if (args.length === 1) {
                        const arg = args[0];
                        if (!isObjectLiteral(arg)) {
                            normalizedArgs.push(arg);
                        } else {
                            // if the object has the correct property, use it
                            if (params[0] in arg) {
                                normalizedArgs.push(arg[params[0]]);
                            } else {
                                // pass the object as is
                                normalizedArgs.push(arg);
                            }
                        }
                    }
                } else {
                    if (args.length === 1) {
                        const objArg = args[0];
                        if (!isObjectLiteral(objArg))
                            throw new TypeError(`Wrong number of arguments. expected: ${name}(${params}), got: ${name}(${args})`);
                        if (Object.keys(objArg).length != params.length)
                            throw new TypeError(`Wrong number of parameters. Expected: ${name}(${params}), got: ${name}(${Object.keys(objArg)})`);

                        for (const param of params) {
                            if (!(param in objArg))
                                throw new TypeError(`Missing parameter: ${param}`);
                            normalizedArgs.push(objArg[param]);
                        }
                    } else if (args.length === params.length) {
                        normalizedArgs.push(...args);
                    } else {
                        throw new TypeError(`Wrong number of arguments. expected: ${name}(${params}), got: ${name}(${args})`);
                    }
                }

                let obj = self[pool].get(...normalizedArgs);
                if (obj) return obj;
                obj = Object.create(self.prototype);
                params.forEach((param, i) => {
                    if (typeof normalizedArgs[i] === 'function')
                        Object.defineProperty(obj, param, { get: normalizedArgs[i], enumerable: true });
                    else
                        obj[param] = normalizedArgs[i];
                });
                self[pool].set(...[...normalizedArgs, obj]);

                return Object.freeze(obj);
            }
            self[pool] = new BoxedMultiKeyMap();
            self.prototype = Object.freeze({ [variantName]: name, [isSingleton]: false });
        }
    }

    variants[isData] = true;

    return Object.freeze(variants);
}

export const variantName = Symbol('variantName'),
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

