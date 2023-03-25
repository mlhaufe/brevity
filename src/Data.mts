import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isCamelCase, isCapitalized, isObjectLiteral } from "./utils/index.mjs";
import { extend } from "./index.mjs";
// TypeScript bug: <https://github.com/microsoft/TypeScript/issues/36931>
import * as asst from "./utils/assert.mjs"
const assert: typeof asst['assert'] = asst.assert;

const pool = Symbol('pool');

export const variant = Symbol('variant'),
    isData = Symbol('isData'),
    isSingleton = Symbol('isSingleton');

type NonEmptyArray<T> = readonly [T, ...T[]];
type EmptyArray<_> = readonly [];

export type DataSingleton = {
    [variant]: unknown;
    [isSingleton]: true;
}

export type DataConstructor<PropNames extends VariantDecl> =
    Readonly<{
        [isSingleton]: false
    }> & {
        // named parameters
        (options: { [P in PropNames[number]]: any }): Variant<PropNames>
        // positional parameters. The last parameter (...never[]) is used to prevent excess parameters
        (...args: [...{ [Name in keyof PropNames]: any }, ...never[]]): Variant<PropNames>
    };

export type Variant<PropNames extends VariantDecl> = {
    [P in PropNames[number]]: any
} & {
    [variant]: unknown
    [isSingleton]: false
};

type VariantsDecl = Readonly<
    { [name: string]: readonly string[] } &
    { [extend]?: DataDef<any> }
>;
type VariantDecl = readonly string[];

export type DataDecl = VariantsDecl | VariantDecl;

type VariantConstructor<PropNames extends VariantDecl> =
    PropNames extends EmptyArray<string> ? DataSingleton :
    PropNames extends NonEmptyArray<string> ? DataConstructor<PropNames> :
    never;

type Variants<D extends VariantsDecl> = Readonly<{
    [Name in Extract<keyof D, string>]: VariantConstructor<D[Name]>
} & { [isData]: true }> & D[typeof extend]


export type DataDef<D extends DataDecl> =
    D extends VariantDecl ? VariantConstructor<D> :
    D extends VariantsDecl ? Variants<D> :
    never;

function variantConstructor(params: any[], name: string) {
    function self(...args: any[]) {
        const normalizedArgs: any[] = [];

        if (params.length === 1) {
            if (args.length === 1) {
                const arg = args[0];
                if (!isObjectLiteral(arg))
                    normalizedArgs.push(arg);
                else
                    normalizedArgs.push(params[0] in arg ? arg[params[0]] : arg);
            }
        } else {
            if (args.length === 1) {
                const objArg = args[0];
                assert(isObjectLiteral(objArg),
                    `Wrong number of arguments. expected: ${name}(${params}), got: ${name}(${args})`);

                assert(Object.keys(objArg).length === params.length,
                    `Wrong number of parameters. Expected: ${name}(${params}), got: ${name}(${Object.keys(objArg)})`);

                for (const param of params) {
                    assert(param in objArg, `Missing parameter: ${param}`);
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
        params.forEach((param, i: number) => {
            if (typeof normalizedArgs[i] === 'function')
                Object.defineProperty(obj, param, { get: normalizedArgs[i], enumerable: true });
            else
                obj[param] = normalizedArgs[i];
        });
        self[pool].set(...[...normalizedArgs, obj]);

        return Object.freeze(obj);
    };
    self[pool] = new BoxedMultiKeyMap();
    self.prototype = Object.freeze({ [variant]: self, [isSingleton]: false });

    return self
}

/**
 * Defines a data type
 * @param decl The variants declaration
 * @returns The data definition
 */
export function Data<const D extends DataDecl>(decl: D): DataDef<D> {
    const dataDecl = Array.isArray(decl) ? { 'Anonymous!': decl } : decl;

    assert(isObjectLiteral(dataDecl), 'Data declaration must be an object literal or an array');
    // TODO: how to extend anonymous variant? Maybe each variant should have a reference to the base?

    if (extend in dataDecl && dataDecl[extend] != null)
        assert(isData in dataDecl[extend], 'Data can only extend another Data declaration');

    const result = Object.create(
        extend in dataDecl && dataDecl[extend] != null ? dataDecl[extend] : null
    );
    if (!(isData in result))
        result[isData] = true;

    for (const [name, params] of Object.entries(dataDecl)) {
        assert(isCapitalized(name), `variant name must be capitalized: ${name}`);
        assert(Array.isArray(params), `variant properties must be an array: ${name}`)
        assert(params.every(isCamelCase), `variant properties must be camelCase strings: ${name}: ${params}`);
        assert(new Set(params).size === params.length, `variant properties must be unique: ${name}: ${params}`)

        if (params.length === 0) {
            const obj = result[name] = Object.create(null)
            Object.assign(obj, ({ [variant]: obj, [isSingleton]: true }))
            Object.freeze(obj)
        } else {
            result[name] = Object.freeze(variantConstructor(params, name))
        }
    }

    if (Object.keys(result).length === 1 && 'Anonymous!' in result)
        return result['Anonymous!'];

    return Object.freeze(result);
}