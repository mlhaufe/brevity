export type Constructor<T> = new (...args: any[]) => T;

type TupleToUnion<T extends any[]> = T[number];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type Data<T extends Record<string, Record<string, any>>> = {
    [K in NonFunctionPropertyNames<T>]: keyof T[K] extends never ?
        () => T[K] :
        (args: {[J in NonFunctionPropertyNames<T[K]>]: T[K][J]}) => NonFunctionProperties<T[K]>
};
