import { isObjectLiteral } from "./predicates.mjs";

/**
 * Normalizes the arguments passed to a variant constructor to an array of values
 * @param {string[]} propNames
 * @param {any[]} args
 * @param {string} VName - The name of the variant
 * @returns {any[]} - The normalized arguments
 */
export function normalizeArgs(propNames, args, VName) {
    if (propNames.length === 1) {
        if (args.length === 1) {
            const arg = args[0];
            if (!isObjectLiteral(arg))
                return [arg];
            else
                return [propNames[0] in arg ? arg[propNames[0]] : arg];
        }
    } else {
        if (args.length === 1) {
            const objArg = args[0];
            if (typeof objArg !== 'object' || objArg == null)
                throw new TypeError(`Object expected, got ${objArg}`)

            if (Object.keys(objArg).length !== propNames.length)
                throw new TypeError(
                    `Wrong number of arguments. expected: ${VName}(${propNames}) got: ${VName}(${Object.keys(objArg)})`
                );
            return propNames.map((propName) => {
                if (!(propName in objArg))
                    throw new TypeError(`Missing parameter: ${propName}`);
                return objArg[propName];
            });
        } else if (args.length === propNames.length) {
            return [...args]
        } else {
            throw new TypeError(`Wrong number of arguments. expected: ${VName}(${propNames}), got: ${VName}(${args})`);
        }
    }
}