import { DataDef, VariantConstructor, Singleton, variantName, isData } from './Data.mjs';

type TraitDef<PS extends [DataDef<any>, ...unknown[]], U> = (...args: PS) => U

// define a type TraifFns that accepts two type parameters D and U.
// D is a DataDef.
// The type returns an object where the keys are the [variantName] of D and the values
// are functions that accept a 'self' parameter of type D and return a value of type U
// The [isData] property is excluded from the keys of D
type TraitFns<PS extends [DataDef<any>, ...unknown[]], U> = {
    [K in Exclude<keyof PS[0], typeof isData>]: (...args: PS) => U
}



export function Trait<const PS extends [DataDef<any>, ...unknown[]], U>(traitFns: TraitFns<PS, U>): TraitDef<PS, U> {
    return undefined as any
}