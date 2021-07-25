/*!
 * @license
 * Copyright (C) 2020 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

export default abstract class Algebra {
    ofType: unknown;
}

export type Constructor<T> = new (...args: any[]) => T;

type TupleToUnion<T extends any[]> = T[number];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/** */
export function merge<A extends Constructor<Algebra>[]>(...algebras: [...A]): UnionToIntersection<TupleToUnion<[...A]>> {

}