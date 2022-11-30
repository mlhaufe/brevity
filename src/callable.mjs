/**
 * Enables a class to be constructable by a function call  
 * @param Constructor 
 * @returns 
 */
export function callable(Constructor) {
    return new Proxy(Constructor, {
        apply(Target, thisArg, argArray) {
            return new Target(...argArray)
        }
    })
}