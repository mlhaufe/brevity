import { ZipTuple } from "./ZipTuple.mjs";

/**
 * Convert a tuple of tuples into an object
 * @example
 * KeyValTuplesToObject<['name', 'age', 'isActive'], [string, number, boolean]>
 *   => { name: string, age: number, isActive: boolean }
 *
 */
type KeyValTuplesToObject<K extends readonly PropertyKey[], V extends readonly any[]> =
    { [T in ZipTuple<K, V>[number]as T[0]]: T[1] };