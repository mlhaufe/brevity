import { isObjectLiteral } from "./isObjectLiteral.mjs";

export const isData = Symbol('isData'),
    isSingleton = Symbol('isSingleton'),
    variantName = Symbol('variantName')

// type Capitalized = `${Uppercase<string>}${Lowercase<string>}`;
// type CamelCase = `${Lowercase<string>}${Capitalize<string>}`;

type NonEmptyArray<T> = readonly [T, ...T[]];
type EmptyArray<_> = readonly [];
type VariantsDef = Readonly<{ [K: string]: EmptyArray<string> | NonEmptyArray<string> }>;

type PropTypes = { [K: string]: any[] }

// Zip two tuples together into a tuple of tuples
// example: ZipTuple<[1, 2, 3], ['a', 'b']> = [[1, 'a'], [2, 'b'], [3, undefined]]
type ZipTuple<T extends readonly any[], U extends readonly any[]> = {
    [K in keyof T]: [T[K], K extends keyof U ? U[K] : never]
}

// Convert a tuple of tuples into an object
// example: KeyValTuplesToObject<[['a', 1], ['b', 2]]> = { a: 1, b: 2 }
type KeyValTuplesToObject<K extends readonly PropertyKey[], V extends readonly any[]> =
    { [T in ZipTuple<K, V>[number]as T[0]]: T[1] };


type DataDef<P extends PropTypes, V extends VariantsDef> = Readonly<
    { [isData]: true } &
    {
        [K in keyof V]: V[K] extends NonEmptyArray<string> ?
        Variant<ZipTuple<V[K], P[K]>, K, V[K]> :
        //Variant<?, K, V[K]> : 
        Singleton<K>
    }
>;

export type Singleton<K> = Readonly<{ [variantName]: K, [isSingleton]: true }>;
export type Variant<T extends readonly any[], K, PS extends NonEmptyArray<string>> = Readonly<{
    [variantName]: K
    [isSingleton]: false
}> & {
    // named parameters
    (options: { [P in PS[number]]: any }): Readonly<{ [P in PS[number]]: any }>
    // positional parameters. ...never[] is used to prevent excess parameters
    //(...args: [...{ [K in keyof PS]: any }, ...never[]]): Readonly<{ [P in PS[number]]: any }>
};

function def<T extends PropTypes, V extends VariantsDef>(variants: V): DataDef<T, V> {
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
        } else {
            // otherwise each type becomes a constructor
            result[name] = function (...args: any[]) {
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

                return Object.seal(obj);
            }
            result[name].prototype = Object.freeze({ [variantName]: name, [isSingleton]: false });
        }
    }

    Object.assign(result, { [isData]: true });

    return Object.freeze(result) as DataDef<V>;
}

/**
 * Defines a data type
 * @overload
 * @param variantsDef The variants definition
 * @returns The data type
 */

/**
 * Defines a data type with inheritance from a base data type
 * @overload
 * @param Base The base data type
 * @param variantsDef The variants definition
 * @returns The data type
 */

/**
 * @param Base
 * @param [variantsDef]
 */
export function Data<const T extends PropTypes, const V extends VariantsDef>(variantsDef: V): DataDef<T, V>;
export function Data<const T extends PropTypes, const V extends VariantsDef>(Base: DataDef<any, V>, variantsDef: V): DataDef<T, V>;
export function Data<const T extends PropTypes, const V extends VariantsDef>(Base: V | DataDef<any, V>, variantsDef?: V): DataDef<T, V> {
    let data;
    if (Base && variantsDef) {
        data = Object.assign(Object.create(null), Base as DataDef<any, V>, def(variantsDef));
    }
    else if (Base && !variantsDef) {
        data = def(Base as V);
    }
    else {
        throw new TypeError('Data requires at least one argument');
    }

    return Object.freeze(data);
}