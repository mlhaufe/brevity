import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isObjectLiteral, isCapitalized, isCamelCase } from "./utils/index.mjs";

export const variantName = Symbol('variantName'),
    isData = Symbol('isData'),
    isSingleton = Symbol('isSingleton'),
    pool = Symbol('pool');

/**
 * A non-empty array type
 */
type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * An empty array type
 */
type EmptyArray<_> = readonly [];

/**
 * Zip two tuples together into a tuple of tuples
 * @example
 * ZipTuple<['name', 'age', 'isActive'], [string, number, boolean]>
 *     => [["name", string], ["age", number], ["isActive", boolean]]
 */
type ZipTuple<T extends readonly any[], U extends readonly any[]> = {
    [K in keyof T]: [T[K], K extends keyof U ? U[K] : never]
}

/**
 * Convert a tuple of tuples into an object
 * @example
 * KeyValTuplesToObject<['name', 'age', 'isActive'], [string, number, boolean]>
 *   => { name: string, age: number, isActive: boolean }
 *
 */
type KeyValTuplesToObject<K extends readonly PropertyKey[], V extends readonly any[]> =
    { [T in ZipTuple<K, V>[number]as T[0]]: T[1] };

/**
 * A type of the properties of a data type
 * @example
 * { Person: [string, number], Company: [string] }
 */
type VariantsDef = Readonly<{ [K: string]: EmptyArray<string> | NonEmptyArray<string> }>;

/**
 * A data type definition
 */
export type DataDef<V extends VariantsDef> = Readonly<
    { [isData]: true } &
    {
        [K in keyof V]: V[K] extends NonEmptyArray<string> ?
        VariantConstructor<K, V[K]> :
        Singleton<K>
    }
>;

/**
 * A singleton type with a variant name K
 */
export type Singleton<K> = Readonly<{ [variantName]: K, [isSingleton]: true }>;

export type Variant<K, PS extends NonEmptyArray<string>> = Readonly<{
    [variantName]: K;
} & {
        [P in PS[number]]: any;
    }>;

export type VariantConstructor<K, PS extends NonEmptyArray<string>> = Readonly<{
    [isSingleton]: false
}> & {
    // named parameters
    (options: { [P in PS[number]]: any }): Variant<K, PS>
    // positional parameters. The last parameter (...never[]) is used to prevent excess parameters
    (...args: [...{ [K in keyof PS]: any }, ...never[]]): Variant<K, PS>
};

function def<V extends VariantsDef>(variants: V): DataDef<V> {
    if (!isObjectLiteral(variants))
        throw new TypeError('variants declaration must be an object literal');

    const dataDef: DataDef<V> = Object.create(null);

    for (const [name, params] of Object.entries(variants)) {
        if (!isCapitalized(name))
            throw new TypeError(`variant name must be capitalized: ${name}`);
        if (!params.every(isCamelCase))
            throw new TypeError(`variant properties must be camelCase strings: ${name}: ${params}`);
        if (new Set(params).size !== params.length) {
            throw new TypeError(`type parameters must be unique: ${name}: ${params}`);
        }
        // if the type has no parameters, it is a singleton
        if (params.length === 0) {
            Reflect.set(dataDef, name,
                Object.freeze(
                    Object.assign(Object.create(null), ({ [variantName]: name, [isSingleton]: true }))
                )
            )
        } else {
            // otherwise each type becomes a constructor
            function self(...args: any[]) {
                const normalizedArgs: any[] = [];

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

                const cached: Variant<any, any> | undefined = self[pool].get(...normalizedArgs);
                if (cached) return cached;
                const obj = Object.create(self.prototype);
                params.forEach((param, i) => {
                    if (typeof normalizedArgs[i] === 'function')
                        Object.defineProperty(obj, param, { get: normalizedArgs[i], enumerable: true });
                    else
                        obj[param] = normalizedArgs[i];
                });
                self[pool].set(...[...normalizedArgs, obj]);

                return Object.freeze(obj);
            }
            Reflect.set(dataDef, name, self);
            self[pool] = new BoxedMultiKeyMap();
            self.prototype = Object.freeze({ [variantName]: name, [isSingleton]: false });
        }
    }

    Reflect.set(dataDef, isData, true);

    return Object.freeze(dataDef);
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
export function Data<const V extends VariantsDef>(variantsDef: V): DataDef<V>;
export function Data<const V extends VariantsDef>(Base: DataDef<V>, variantsDef: V): DataDef<V>;
export function Data<const V extends VariantsDef>(Base: V | DataDef<V>, variantsDef?: V): DataDef<V> {
    let data
    if (Base && variantsDef) {
        if (!(isData in Base))
            throw new TypeError('Base must be a Data type');
        data = Object.assign(Object.create(null), Base, def(variantsDef));
    }
    else if (Base && !variantsDef) {
        data = def(Base as V);
    }
    else {
        throw new TypeError('Data requires at least one argument');
    }

    return Object.freeze(data);
}