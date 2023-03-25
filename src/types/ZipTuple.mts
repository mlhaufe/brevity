/**
 * Zip two tuples together into a tuple of tuples
 * @example
 * ZipTuple<['name', 'age', 'isActive'], [string, number, boolean]>
 *     => [["name", string], ["age", number], ["isActive", boolean]]
 */
export type ZipTuple<T extends readonly any[], U extends readonly any[]> = {
    [K in keyof T]: [T[K], K extends keyof U ? U[K] : never]
}