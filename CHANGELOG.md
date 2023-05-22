# Changelog

## v0.12.0

- Trait is not longer callable and must be complected before use.
- Due to the above, primitive traits and partial application are no longer supported.
- `data` and `trait` can now extend complected objects directly.
- `Symbol(extend)` deprecated. `trait` and `data` are now overloaded to use the first argument as the extension object.
- Parameterized data decls are used to make complected objects parameterized.
- Pattern matching functionality is now used via a `Pattern` object.
- updated README
- updated dependencies

## v0.11.1

- Fixed package.json module export configuration

## v0.11.0

- Defined *.d.ts
- Implemented derived fields
- Updated README

## v0.10.0

- `Data` and `Trait` are now lowercase: `data`and `trait`
- Removed data-shorthand syntax
- Property declarations must now be object literals instead of arrays.
- Property Guards now available.
- Deprecated and removed symbols `data`, `isSingleton`, `variant`, `variantName`
- Added utility functions: `isDataVariant`, `isDataDecl`, `isTrait`, `isComplectedVariant`
- Updated README
- Updated dependencies
- Introduced `complect` to combine data and trait declarations
- Updated package keywords to include `Family Polymorphism`
- Traits can now be parameterized with a family reference to utilize the ultimately complected object:

```js
const myTrait = trait(dataDecl, (family) => ({ ... }))
```

## v0.9.0

- Enabled array destructuring on variants
- Traits support array pattern matching
- Traits support Partial Application
- Trait declaration entries must have consistent arity
- Updated README

## v0.8.0

- Replaced `Symbol(all)` with `_` in `Trait` declarations
- Added `Symbol(_)` for use with `Trait` pattern matching
- Added `Symbol(data)` for use with `Trait` declarations
- Added `Symbol(variantName)` to every data instance
- Extended `Trait` to allow matching on primitives `Number`, `String`, `Boolean`, `BigInt`
- Added pattern matching in Trait declarations
- Updated README
- Added SEO keywords

## v0.7.1

- Improved error messaging on invalid Trait declarations
- Added status badges to README
- Updated dependencies

## v0.7.0

### Data shorthand

Enabled a shorthand form for single variant Data declarations:

```js
const Disk = Data({
    Disk: ['position', 'velocity', 'radius', 'item']
})
```

Can now be written as:

```js
const Disk = Data(['position', 'velocity', 'radius', 'item'])
```

### `variantName` subsumed by `variant`

The `variantName` symbol has been removed. Each instance now has a `variant` symbol reference that points to its constructor. If the variant is a singleton, it just points to itself.

### `Trait` requires a Data declaration as its first argument

Trait must now be provided its associated data declaration as the first argument:

```js
const Color = Data({ Red: [], Green: [], Blue: [] });

const print = Trait(Color, {
    Red() { return '#FF0000' },
    Green() { return '#00FF00' },
    Blue() { return '#0000FF' }
})
```

### Inheritance now accomplished via `extend` symbol

Inheritance is now accomplished on Data and Trait via use of this `extend` property.

For `Data`:

```js
const IntExp = Data({ Lit: ['value'], Add: ['left', 'right'] })

const IntBoolExp = Data({
    [extend]: IntExp,
    Bool: ['value'], 
    Iff: ['pred', 'ifTrue', 'ifFalse'] 
})
```

For `Trait`:

```js
const intPrint = Trait(IntExp, {
    Lit({ value }) { ... },
    Add({ left, right }) { ... }
})

const intBoolPrint = Trait(IntBoolExp, {
    [extend]: intPrint,
    Bool({ value }) { ... },
    Iff({ pred, ifTrue, ifFalse }) { ... }
});
```

### Updated README

The README now documents the above. Additionally an example of overriding `[apply]` has been provided

### Updated dependencies

Project dependencies updated to latest versions

## v0.6.2

- Updated `README.md` to reflect npm usage.
- Updated package keywords

## v0.6.1

- Created npm package

## v0.6.0

- Renamed `typeName` symbol to `variantName`
- Exposed `variantName` and `isTrait` symbols
- Data variants are reverted back to immutable.
- Non-singleton Data variants now utilize object pooling so that `Point3(1,2,3) === Point3({x:1,y:2,z:3})`
- Removed `@final-hill/multi-key-map` dependency

## v0.5.0

- Added webpack build
- Added source mapping
- Added missing mutability test

## v0.4.1

- Updated dependencies
- Enabled mutability of data variant fields. Variants are still sealed.

## v0.4.0

- `Data` now supports lazy fields:

```js
const Person = Data({
    Employee: ['firstName', 'lastName', 'fullName']
})

const p = Person.Employee({
    firstName: 'John',
    lastName: 'Doe',
    // becomes a getter
    fullName: () => `${p.firstName} ${p.lastName}`
})

p.fullName === 'John Doe'
```

- Added `memoFix` for managing self recursive traits

## v0.2.5

- Bugfix of singleton Data variants to no longer extend `Object.prototype`

## v0.2.4

- Bugfix of single parameter Data calls to differentiate object literals from object params

## v0.2.3

- Data variants can now be called with positional parameters
- Updated README

## v0.2.2

- Updated README.md
- Added `all` option to `Trait`
- Exposed `isData` and `isSingleton` symbols
- Removed dead code
- Updated license

## v0.2.1

- Fixed `dist` script
- Updated README.md
- Exporting `apply` symbol
- Bugfix of Trait overloading
- Fixed extensibility unit tests
- Created arithmetic unit tests

## v0.2.0

- Replaced Object Algebra approach with an alternative
- Re-enabled GitHub publish workflow

## v0.1.5

- Including `dist` folder in repo to support direct installation from repo
- Disabled GitHub publish workflow

## v0.1.4

- package config updates

## v0.1.3

- Fixed family polymorphism references

## v0.1.2

- Replaced npm publish pipeline with GitHub publish

## v0.1.1

- npm publish pipeline fix

## v0.1.0

- Initial checkin
