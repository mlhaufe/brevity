# TODO

## JavaScript vs TypeScript differences

### Data

```ts
const Exp = Data({ Lit: ['value'], Add: ['left', 'right'] }),
    {Add, Lit} = Exp
```

The type of the constructors will structurally have the appropriate names:

```ts
const Lit: (options: {
    value: any
}) => Readonly<{
    value: any
}>

const Add: (options: {
    left: any;
    right: any;
}) => Readonly<{
    left: any;
    right: any;
}>
```

But the acceptable types for the values are not known, so to provide these constraints the following additional
type can be used:

```ts
type ExpData = { Lit: [number], Add: [ExpData, ExpData] }
const Exp = Data<ExpData>({ Lit: ['value'], Add: ['left', 'right'] }),
    {Add, Lit} = Exp
```

The constructor types are now:

```ts
const Lit: (options: {
    value: number
}) => Readonly<{
    value: number
}>

const Add: (options: {
    left: ExpData;
    right: ExpData;
}) => Readonly<{
    left: ExpData;
    right: ExpData;
}>
```
