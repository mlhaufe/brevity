function def(types) {
    if (typeof types !== 'object' || types === null || Array.isArray(types)) {
        throw new TypeError('types must be an object literal');
    }
    for (const [name, params] of Object.entries(types)) {
        // each type name must be capitalized
        if (typeof name !== 'string' || !name.match(/^[A-Z][A-Za-z0-9]*$/)) {
            throw new TypeError(`type name must be capitalized: ${name}`);
        }
        // each type must be an array of camelCase strings
        if (!Array.isArray(params) || params.some(param => typeof param !== 'string' || !param.match(/^[a-z][A-Za-z0-9]*$/))) {
            throw new TypeError(`type parameters must be camelCase strings: ${name}`);
        }
        // each parameter must be unique
        if (new Set(params).size !== params.length) {
            throw new TypeError(`type parameters must be unique: ${name}`);
        }
        // if the type has no parameters, it is a singleton
        if (params.length === 0) {
            types[name] = Object.freeze({ [typeName]: name, [isSingleton]: true });
        } else {
            // otherwise each type becomes a constructor with named parameters
            types[name] = function (args) {
                const obj = Object.create(types[name].prototype);

                // every parameter must be in the args
                for (const param of params) {
                    if (!(param in args)) {
                        throw new TypeError(`missing parameter: ${param}`);
                    }
                }

                Object.assign(obj, args, { [typeName]: name, [isSingleton]: false });

                // each type is immutable
                return Object.freeze(obj);
            }
        }
    }
    // each type is tagged with a symbol
    types[isData] = true;
    // the type declaration is immutable
    return Object.freeze(types);
}

export const typeName = Symbol('typeName'),
    isData = Symbol('isData'),
    isSingleton = Symbol('isSingleton');

/**
 * Data types with named parameters and immutable objects.
 * @param {Object} types
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
export function Data(Base, types) {
    let data
    if (Base && types) {
        if (!Base[isData])
            throw new TypeError('Base must be a Data type');
        data = Object.assign({}, Base, def(types));
    }
    else if (Base && !types) {
        data = def(Base);
    }
    else {
        throw new TypeError('Data requires at least one argument');
    }

    return Object.freeze(data);
}

