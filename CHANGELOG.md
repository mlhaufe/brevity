# Changelog

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
