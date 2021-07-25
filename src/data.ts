/*!
 * @license
 * Copyright (C) 2020 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type Data<T extends Record<string, Record<string, any>>> = {
    [K in NonFunctionPropertyNames<T>]: keyof T[K] extends never ?
        () => T[K] :
        (args: {[J in NonFunctionPropertyNames<T[K]>]: T[K][J]}) => NonFunctionProperties<T[K]>
};

// variants: T | ((self: T) => T)
/**
 *
 * @param {Record<string, Record<string, any>>} variants -
 * @returns {Data<T>} -
 */
function data<T extends Record<string, Record<string, any>>>(variants: T): Data<T> {
    const factory = Object.assign(Object.create(null), {

    });

    Object.keys(variants ?? {}).forEach(key => {
        if(typeof variants[key] == 'function')
            {throw new Error(`Variants can not be functions. '${key}'`);}
        if(key[0].toUpperCase() != key[0])
            {throw new Error(`Variant name must start with a capital letter: '${key}' -> '${key[0].toUpperCase()+key.substr(1)}'`);}

        /**
         *
         * @param {Record<string, Record<string, unknown>>} args -
         * @returns {void}
         */
        function Constructor(args: Record<string, Record<string, unknown>>): void {
            if(new.target == undefined)
                // @ts-ignore
                {return new Constructor(args);}
                // @ts-ignore
            Object.assign(this, args);
        }

        factory[key] = Constructor;
    });

    return factory;
}

export default data;