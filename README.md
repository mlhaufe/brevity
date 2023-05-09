# Brevity

[![Build](https://github.com/mlhaufe/brevity/workflows/Build/badge.svg?branch=master)](https://github.com/mlhaufe/brevity/actions?query=workflow%3ABuild%2FRelease)
[![npm version](https://badge.fury.io/js/%40mlhaufe%2Fbrevity.svg)](https://www.npmjs.com/package/@mlhaufe/brevity)
[![Downloads](https://img.shields.io/npm/dm/@mlhaufe/brevity.svg)](https://www.npmjs.com/package/@mlhaufe/brevity)

Brevity is a library that enables [Feature-Oriented Programming (FOP)](https://en.wikipedia.org/wiki/Feature-oriented_programming) and solves the expression problem
in a manner that makes data and operation declarations trivial to define and compose.

## Installation

The latest version:

```powershell
npm install @mlhaufe/brevity
```

A specific version:

```powershell
npm install @mlhaufe/brevity@x.x.x
```

For direct use in a browser (no build step):

```html
<script type="importmap">
{
  "imports": {
    "@mlhaufe/brevity": "https://unpkg.com/@mlhaufe/brevity/index.mjs",
  }
}
</script>
<script type="module">
  import {data} from '@mlhaufe/brevity';

  console.log(typeof data); // 'function'
</script>
```

## Data

### Enumerated data

Enumerations can be declared similar to how you would in a functional language:

```js
const colorData = data({ Red: {}, Green: {}, Blue: {} });
```

Variants without properties are considered singletons:

```js
const red = colorData.Red,
    red2 = colorData.Red

red === red2
```

Each variant can have properties. These properties become named parameters of each constructor:

```js
const pointData = data({
        Point2: {x: {}, y: {}},
        Point3: {x: {}, y: {}, z: {}} 
    }),
    {Point2, Point3} = pointData

const p2 = Point2({x: 3, y: 2}),
      p3 = Point3({x: 12, y: 37, z: 54})

p2.x === 3
p2.y === 2
```

Positional parameters are also supported:

```js
const p2 = Point2(3, 2),
      p3 = Point3(12, 37, 54)

p2.x === 3
p2.y === 2
```

### Guards

Data declarations support guards:

```js
// Constructor guards
const pointData = data({
    Point2: { x: Number, y: Number },
    Point3: { x: Number, y: Number, z: Number }
}),
{ Point2, Point3 } = pointData;

// TypeError: Guard mismatch on property 'y'. Expected: Number, got: "2"
Point2(1, '2') 
```

```js
// Recursive guard:
const peanoData = data((Peano) => ({
    Zero: {},
    Succ: { pred: Peano }
})),
{ Zero, Succ } = peanoData;

const z = Zero,
    one = Succ(z),
    two = Succ(one)

// TypeError: Guard mismatch on property 'pred'. Expected: TypeRecursion, got: 1
Succ(1)
```

```js
// Parameterized recursive guard:
const ListData = data((List, T) => ({
    Nil: {},
    Cons: { head: T, tail: List(T) }
}));

const numListData = ListData(Number),
    { Nil, Cons } = numListData;

// [1, 2, 3]
const xs = Cons(1, Cons(2, Cons(3, Nil)))

// [1, 2, '3']
const ys = Cons(1, Cons(2, Cons('3', Nil)))
// TypeError: Guard mismatch on property 'head'. Expected: Number, got: "3"
```

### Destructuring

Variants support both object and array destructuring:

```js
const disk = Disk({ position: [0, 0], velocity: [1, 3], radius: 1, item: 'apple' });

const [position, velocity, radius, item] = disk;

const { position, velocity, radius, item } = disk;
```

### Extending Data

Data declarations can be extended by utilizing the `extend` symbol:

```js
const IntExp = data({ 
    Lit: { value: {} }, 
    Add: { left: {}, right: {} }
})

const IntBoolExp = data({ 
    [extend]: IntExp,
    Bool: { value: {} }, 
    Iff: { pred: {}, ifTrue: {}, ifFalse: {}}  
}),
    {Add, Lit, Bool, Iff} = IntBoolExp

// if (true) 1 else 1 + 3
const exp = Iff( Bool(true), Lit(1), Add(Lit(1), Lit(3)) )
```

### Lazy fields

`data` supports lazy fields via passing a function to the instance which becomes a getter for that field:

```js
const Person = data({
    Employee: {firstName: String, lastName: String, fullName: String}
})

const p = Person.Employee({
    firstName: 'John',
    lastName: 'Doe',
    // becomes a getter
    fullName: () => `${p.firstName} ${p.lastName}`
})

p.fullName === 'John Doe'
```

This can also be used for self-referential structures:

```js
const Lang = data({
    Alt: {left: {}, right: {}},
    Cat: {first: {}, second: {}},
    Char: {value: {}},
    Empty: {},
}),
    { Alt, Empty, Cat, Char } = Lang

// balanced parentheses grammar
// S = S ( S ) ∪ ε
const S = Alt(Cat(() => S, Cat(Char('('), Cat(() => S, Char(')')))), Empty)

S.left.first === S
```

### Equality

As mentioned above, variants without properties are considered singletons:

```js
const red = Color.Red,
    red2 = Color.Red

red === red2
```

Which is what allows strict equality comparisons.

Non-singleton variants also support strict equality comparisons:

```js
const Point = data({ 
    Point2: {x: Number, y: Number}, 
    Point3: {x: Number, y: Number, z: Number} 
}),
    {Point2, Point3}

Point3(1,2,3) === Point3({x:1, y:2, z:3}) // true
```

This enabled via [object-pooling](https://en.wikipedia.org/wiki/Object_pool_pattern) in a WeakMap behind the scenes.

Besides the convenience of the above, this also enables use of variant declarations in native JavaScript collections
directly like Array, Map, Set, etc.

```js
const Point = data({ 
    Point2: {x: Number, y: Number}, 
    Point3: {x: Number, y: Number, z: Number} 
}),
    { Point2, Point3 } = Point;

const pArray = [Point2(1, 2), Point3(1, 2, 3)];

pArray.includes(Point2(1, 2)) // true
pArray.includes(Point2({ x: 1, y: 2 })) //true
pArray.includes(Point3(1, 2, 3)) // true
pArray.includes(Point3({ x: 1, y: 2, z: 3 })) // true
pArray.includes(Point2(1, 3)) // false
pArray.includes(Point3(1, 2, 4)) // false

const pSet = new Set([Point2(1, 2), Point3(1, 2, 3)]);

pSet.has(Point2(1, 2)) // true
pSet.has(Point2({ x: 1, y: 2 })) // true
pSet.has(Point3(1, 2, 3)) // true
pSet.has(Point3({ x: 1, y: 2, z: 3 })) // true
pSet.has(Point2(1, 3)) // false
pSet.has(Point3(1, 2, 4)) // false

const pMap = new Map([
    [Point2(1, 2), 1],
    [Point3(1, 2, 3), 2]
]);

pMap.has(Point2(1, 2)) // true
pMap.has(Point2({ x: 1, y: 2 })) // true
pMap.has(Point3(1, 2, 3)) // true
pMap.has(Point3({ x: 1, y: 2, z: 3 })) // true
pMap.has(Point2(1, 3)) // false
pMap.has(Point3(1, 2, 4)) // false
```

### isDataVariant, isDataDecl

`isDataVariant` and `isDataDecl` are provided for convenience:

```js
const Color = data({ Red: {}, Green: {}, Blue: {} });

isDataVariant(Color.Red) // true

isDataDecl(Color) // true
```

## Traits

A `trait` associates operations with data declarations and supports pattern matching.

```js
const Color = data({ Red: {}, Green: {}, Blue: {} });

const print = trait(Color, {
    Red() { return '#FF0000' },
    Green() { return '#00FF00' },
    Blue() { return '#0000FF' }
})

print(Color.Red) // '#FF0000'
```

The trait `print` is a function that can then be applied to data instances.

```js
const List = data({ Nil: {}, Cons: {head: {}, tail: {}} });

const concat = trait(List, {
    Nil(_, ys) { return ys },
    Cons({ head, tail }, ys) {
        return List.Cons({ head, tail: concat(tail, ys) })
    }
})

// [1, 2]
const xs = Cons(1, Cons(2, Nil)),
    // [3, 4]   
    ys = Cons(3, Cons(4, Nil)),
    // xs ++ ys == [1, 2, 3, 4]
    zs = concat(xs, ys);
```

### Wilcard `_` trait

If the same operation should be applied to all variants, then the `_` token can be used:

```js
const operation = trait(undefined, {
    _: (target) => JSON.stringify(target)
})
```

Note that in this case a data declaration was not provided as an argument since it's irrelevant.

A more practical example:

```js
const isNil = trait(List, {
    _: () => false,
    Nil: () => true
});
```

In this case `Nil` takes priority over `_` and works as expected.

If a data declaration is not provided, `_` or `[apply]` must be defined.

### Primitives

Traits can be defined for primitives `Number`, `String`, `Boolean`, `BigInt`:

```js
const printNumber = trait(Number, {
    1: (n) => 'one',
    15: (n) => 'fifteen',
    [Infinity]: (n) => 'infinity',
    [Number.EPSILON]: (n) => 'epsilon',
    [Number.MAX_SAFE_INTEGER]: (n) => 'max safe integer',
    [Number.MAX_VALUE]: (n) => 'max value',
    [Number.MIN_VALUE]: (n) => 'min value',
    [Number.NaN]: (n) => 'not a number',
    [NaN]: (n) => 'not a number',
    [Number.POSITIVE_INFINITY]: (n) => 'positive infinity',
    [Number.NEGATIVE_INFINITY]: (n) => 'negative infinity',
    _: (n) => n.toString()
})

printNumber(15) === 'fifteen'

const fib = trait(Number, {
    0: (n) => 0,
    1: (n) => 1,
    _: (n) => fib(n - 1) + fib(n - 2)
})

fib(12) === 144

const printString = trait(String, {
    '': (s) => 'empty string',
    'hello': (s) => s,
    _: (s) => s
})

printString('') === 'empty string'

const printBoolean = trait(Boolean, {
    true: () => 'true',
    false: () => 'false'
})

printBoolean(true) === 'true'

const printBigInt = trait(BigInt, {
    '0n': (n) => 'zero',
    '1n': (n) => 'one',
    '1234567890123456789012345678901234567890n': (n) => 'a big number',
    _: (n) => n.toString()
})

printBigInt(1234567890123456789012345678901234567890n) === 'a big number'
```

### Nested Pattern Matching

More advanced pattern matching is supported beyond simply variants and utilize `Symbol(_)`
as a wildcard.

```js
const Expr = data({ 
        Num: {value: {}}, 
        Var: {name: {}}, 
        Mul: {left: {}, right: {}} 
    }),
    { Num, Var, Mul } = Expr

// 1 * x = x
// x * 1 = x
// 0 * x = 0
// x * 0 = 0
const simplify = trait(Expr, {
    _: (self) => self,
    Mul: [
        [Mul(Num(1), _), ({ right }) => right],
        [Mul(_, Num(1)), ({ left }) => left],
        [Mul(Num(0), _), ({ left }) => left],
        [Mul(_, Num(0)), ({ right }) => right]
    ]
})

const e1 = Mul(Var('x'), Num(1))

simplify(e1) === Var('x')

const e2 = Mul(Num(1), Var('x'))

simplify(e2) === Var('x')

const e3 = Mul(Num(0), Var('x'))

simplify(e3) === Num(0)

const e4 = Mul(Var('x'), Num(0))

simplify(e4) === Num(0)
```

Object literals can be used as well as an alternative to using `_` :

```js
const simplify = trait(Expr, {
    _: (self) => self,
    Mul: [
        [{ left: Num(1) }, ({ right }) => right],
        [{ right: Num(1) }, ({ left }) => left],
        [{ left: Num(0) }, ({ left }) => left],
        [{ right: Num(0) }, ({ right }) => right]
    ]
})
```

A more complicated example with nested patterns:

```js
const List = data({ Nil: {}, Cons: {head: {}, tail: {}} }),
            { Nil, Cons } = List

const tell = trait(List, {
    Nil: (self) => 'The list is empty',
    Cons: [
        [Cons(_, Nil), ({ head }) => 
            `The list has one element: ${head}`],
        [Cons(_, Cons(_, Nil)), ({ head, tail }) => 
            `The list has two elements: ${head} and ${tail.head}`],
        [Cons(_, Cons(_, _)), ({ head, tail }) => 
            `This list is long. The first two elements are: ${head} and ${tail.head}`]
    ]
})
```

A contrived way to test if a list contains the value `3`:

```js
const contains3 = trait(List, {
    Nil: (self) => false,
    Cons: [
        [Cons(3, _), (self) => true],
        [Cons(_, _), ({ tail }) => contains3(tail)]
    ]
})
```

Pattern declarations have the following form:

```js
const traitName = trait(DataDecl, {
  VariantName: [
    [pattern1, pattern2, ...patternN, (self, v2, ...vN) => {...}],
    [pattern1, pattern2, ...patternN, (self, v2, ...vN) => {...}]
  ]
})
```

Note: every pattern must have the same length or an error will be thrown.
In other words the arity of your patterns must be consistent.

A pattern can be one of the following:

```js
// Literals
false
149n
1
'foo'
Symbol('foo')
null
undefined

// wildcard
_

//  variant instances
Nil
Cons(1, Nil)
Cons(pattern1, pattern2)
Cons(1, Cons(pattern, Nil)

// structural 
{left: 3, right: Nil }
{left: pattern1, right: pattern2 }

// array
[pattern1, pattern2, ... , patternN]
```

### Partial Application

Traits support [partial application](https://en.wikipedia.org/wiki/Partial_application)
via the usage of the wildcard symbol `Symbol(_)`:

```js
const add3 = trait(Number, {
    _: (a, b, c) => a + b + c
})

add3(1, 2, 3) === 6
add3(_, 2, 3)(1) === 6
add3(1, _, 3)(2) === 6
add3(1, 2, _)(3) === 6
add3(1, _, _)(2, 3) === 6
add3(_, 2, _)(1, 3) === 6
add3(_, _, 3)(1, 2) === 6
add3(_, _, _)(1, 2, _)(3) === 6
add3(_, _, _)(_, 2, _)(1, _)(3) === 6
add3(_, _, _)(_, 2, _)(_, 3)(1) === 6
```

A more practical example where this can be a benefit can be seen with linked lists:

```js
const List = data({ Nil: {}, Cons: {head: {}, tail: {}} })

const { Nil, Cons } = List
```

Concatenation can be defined in terms of foldRight:

```js
const foldRight = trait(List, {
    Nil: (self, fn, z) => z,
    Cons: ({ head, tail }, fn, z) => fn(head, foldRight(tail, fn, z))
})

const concat = (xs, ys) => foldRight(xs, Cons, ys)
```

The only purpose `(xs, ys) => ...` has is to put the arguments into the right
position in `foldRight`. With partial application this can be simplified as:

```js
const concat = foldRight(_, Cons, _)
```

Another example for computing the length of a list:

```js
const length = (xs) => foldRight(xs, (x, acc) => acc + 1, 0)
```

With partial application:

```js
const length = foldRight(_, (x, acc) => acc + 1, 0)
```

### Extending Traits

Like the `data` declaration one `trait` can extend another via the `extend` symbol:

```js
const baseTrait = trait(FooData, {
    Foo(){ ... }
})

const subTrait = trait(BarData, {
    [extend]: baseTrait,
    Bar() { ... }
})
```

`subtrait` can now be applied to both `Foo` and `Bar` instances.

### `dataDecl` symbol

```js
const fooTrait = trait(FooData, {
    Foo(){ ... }
})
```

The associated data declaration `FooData` can be referenced
via the `Symbol(dataDecl)`:

```js
fooTrait[dataDecl] === FooData
```

### Calling 'super'

There may be cases that you need to call the parent trait in the context of the current. This can be accomplished as follows:

```js
const someTrait = trait(FooData, {
    [extend]: parentTrait,
    Foo(self) { parentTrait(self) }
})
```

Recall that traits can be applied as functions.

### Breaking infinite recursion with `memoFix`

With the ability to define [self-referential fields](#lazy-fields), it's necessary to be able to
define traits that won't become stuck in infinite recursion when those fields are accessed. The `memoFix`
trait solves this problem.

Given the following contrived trait you can see that it will blow the stack when called:

```js
const omega = trait(Number, {
    _(x) { return this._(x); }
})

omega(2) // new Error('Maximum call stack size exceeded')
```

By utilizing `memoFix` we can replace this error with a [least-fixed-point](https://en.wikipedia.org/wiki/Least_fixed_point):

```js
const omegaFix = trait(Number, {
    [memoFix]: { bottom: 0 }
    _(x) { return this._(x); }
})

omegaFix(2) === 0
```

A `bottom` value can also be a function which will be called with the respective arguments to determine what the bottom value should be:

```js
const foo = trait(Number, {
    _(x) {
        return (x <= 3) ? 1 + foo(x + 1) : foo(x);
    }
})

foo(1) // new Error('Maximum call stack size exceeded')

const fooFix = trait(Number, {
    [memoFix]: (x) => x ** 2
    _(x) {
        return (x <= 3) ? 1 + foo(x + 1) : foo(x);
    }
})

fooFix(1) === 19
fooFix(2) === 18
fooFix(3) === 17
fooFix(4) === 16
```

The `memoFix` trait memoizes (caches) calls. If the same arguments are encountered a
second time, then the previously computed value is returned. The least-fixed-point (bottom value) is the
initial entry in this cache. So the added benefit of this trait is not just for tying-the-recursive-knot, but
for improving performance:

```js
const fib = trait(Number, {
    _(n) {
        return n < 2 ? n : this._(n - 1) + this._(n - 2);
    }
})

let start, end;

start = performance.now();
fib(40);
end = performance.now();
const time = end - start; // ~4333ms

const fibFix = trait(Number, {
    [memoFix]: { bottom: 0 },
    _(n) {
        return n < 2 ? n : this._(n - 1) + this._(n - 2);
    }
})

start = performance.now();
fibFix(40);
end = performance.now();
const memoTime = end - start; // ~5ms
```

### isTrait

The `isTrait` function can be used to determine if a value is a trait:

```js
isTrait(trait(fooData, {})) === true
isTrait({}) === false
```

## Complection

Data and associated traits can be combined into a single object via the `complect` function:

```js
const pointData = data({
    Point2: { x: Number, y: Number },
    Point3: { x: Number, y: Number, z: Number }
})

const printable = trait(pointData, {
    Point2({ x, y }) { return `(${x}, ${y})` },
    Point3({ x, y, z }) { return `(${x}, ${y}, ${z})` }
})

const point = complect(pointData, { print: printable }),
    { Point2, Point3 } = point
```

`complect` is a function that takes a data declaration and an object of traits. It returns an object with the data declaration's constructors as keys and the traits applied to them as values.

```js
const p1 = Point2(1, 2),
    p2 = Point3(1, 2, 3)

print(p1) // '(1, 2)'
print(p2) // '(1, 2, 3)'

p1.print() // '(1, 2)'
p2.print() // '(1, 2, 3)'
```

### `dataDecl` and `traitDecl` symbols

The `dataDecl` and `traitDecl` symbols are used to access the data declaration and trait declaration of a complected object:

```js
point[dataDecl] === pointData
point[traitDecl] === { print: printable }
```

### Extending complected objects

A data declaration can extend a complected object:

```js
const point4Data = data({
    [extend]: point[dataDecl],
    Point4: { x: Number, y: Number, z: Number, w: Number }
})
```

A trait declaration can also extend a complected object:

```js
const point4Printable = trait({
    [extend]: point[traitDecl],
    Point4({ x, y, z, w }) { return `(${x}, ${y}, ${z}, ${w})` }
})
```

### Referencing complected constructors from within traits

When a trait is defined the complected constructors are not yet available. To reference them from within a trait a function can be used:

```js
const exprData = data({
    Num: { value: {} },
    Var: { name: {} },
    Mul: { left: {}, right: {} }
})

// 1 * x = x
// x * 1 = x
// 0 * x = 0
// x * 0 = 0
const simplify = trait(exprData, (family) => ({
    _: (self) => self,
    Mul: [
        [family.Mul(family.Num(1), _), ({ right }) => right],
        [family.Mul(_, family.Num(1)), ({ left }) => left],
        [family.Mul(family.Num(0), _), ({ left }) => left],
        [family.Mul(_, family.Num(0)), ({ right }) => right]
    ]
}))

const exp = complect(exprData, { simplify }),
    { Num, Var, Mul } = exp
```

In the above, `family` refers to the ultimately complected object.

You are free to use any name you'd like for this variable. Here is the same example using `$` instead of `family`:

```js
const simplify = trait(exprData, ($) => ({
    _: (self) => self,
    Mul: [
        [$.Mul($.Num(1), _), ({ right }) => right],
        [$.Mul(_, $.Num(1)), ({ left }) => left],
        [$.Mul($.Num(0), _), ({ left }) => left],
        [$.Mul(_, $.Num(0)), ({ right }) => right]
    ]
}))
```

### isComplectedVariant

The `isComplectedVariant` function can be used to determine if a value is a complected variant:

```js
isComplectedVariant(point.Point2(1, 2)) === true
```

## The Expression Problem

### Description

The expression problem is a term used in computer science to describe a particular design problem that arises when a programming language or system provides ways to extend the system in two separate, but related, ways. The two ways in which the system can be extended are:

Adding new data types: This involves defining new data types and adding operations on them.

Adding new operations: This involves defining new operations that can be applied to existing data types.

The expression problem arises when it is not possible to add new data types and new operations in a way that is both easy to use and efficient. In particular, it can be difficult to add new operations if the system is not designed to accommodate them, and it can be difficult to add new data types if the system does not provide sufficient support for them.

### Functional

Here is an example of the problem in the functional paradigm:

```ts
// data declaration
type Exp =
    { tag: 'Lit', value: number } |
    { tag: 'Add', left: Exp, right: Exp }

// operations
let evaluate = (exp: Exp) =>
    exp.tag === 'Lit' ? exp.value :
    evaluate(exp.left) + evaluate(exp.right)

let printExp = (exp: Exp) => 
    exp.tag === 'Lit' ? `${exp.value}` :
    `${printExp(exp.left)} + ${printExp(exp.right)}`
```

Adding a new operation `isValue(exp)` is trivial in this paradigm. Just define a new function:

```ts
let isValue = (exp: Exp) => exp.tag === 'Lit';
```

Adding a new data type `{ tag: 'Add', left: Exp, right: Exp }` is not easy though.
All existing operations have to be modified to support the new data type.

### Object-Oriented

In the Object-oriented paradigm the dual problem exists:

```ts
abstract class Exp {
    abstract print(): string
    abstract evaluate(): number
}

class Lit extends Exp {
    // data
    constructor(readonly value: number) { super() }

    //operations
    evaluate(): number {
        return this.value
    }
    print(): string {
        return `${this.value}`
    }
}

class Add implements Exp {
    // data
    constructor(readonly left: Exp, readonly right: Exp) { }

    // operations
    evaluate(): number {
        return this.left.evaluate() + this.right.evaluate()
    }
    print(): string {
        return `${this.left.print()}, + ${this.right.print()}`
    }
}
```

Adding a new data type: `Mul(left, right)` is easy to do in OO style, just create a new class.

```ts
class Mul implements Exp {
    // data
    constructor(readonly left: Exp, readonly right: Exp) { }

    // operations
    evaluate(): number {
        return this.left.evaluate() * this.right.evaluate()
    }
    print(): string {
        return `${this.left.print()} * ${this.right.print()}`
    }
}
```

Trying to add a new operation `Exp.isValue()` is not easy though.
All existing classes must be modified to add the new operation

### Solutions

There are several approaches to solving the expression problem,
[From Object Algebras to Finally Tagless Interpreters](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/).

Here is how the above would be approached with this library:

```js
// data declaration
const expData = data({ 
    Lit: { value: {} }, 
    Add: { left: {}, right: {} }
})

// operations
const evaluate = trait(expData, {
    Lit({value}){ return value },
    Add({left, right}){
        return left.evaluate() + right.evaluate()
    }
})

const print = trait(expData, {
    Lit({value}) { return `${value}` },
    Add({left, right}) {
        return `${left.print()} + ${right.print()}`
    }
})
```

Usage:

```js
const exp = complect(expData, {evaluate, print}),
    {Add, Lit} = exp

// 1 + 3
const add = Add(Lit(1), Lit(3))

evaluate(add) // 4
add.evaluate() // 4

print(add) // "1 + 3"
add.print() // "1 + 3"
```

Adding a new data type `Mul` is as simple as extending the base data type:

```js
const mulExpData = data({ 
    [extend]: exp[dataDecl],
    Mul: { left: {}, right: {} }
})
```

To extend `evaluate` and `print` to the new data declaration, simply extend the existing traits:

```js
const evalMul = trait(mulExpData, {
    [extend]: exp[traitDecl].evaluate,
    Mul({left,right}){ return left.evaluate() * right.evaluate() }
})

const printMul = trait(mulExpData, {
    [extend]: exp[traitDecl].print,
    Mul({left,right}){ return `${left.print()} * ${right.print()}` }
})
```

Adding a new operation for all data declarations thus far `isValue`:

```js
const isValue = trait(mulExpData, {
    Lit({value}) { return true },
    Add({left,right}) { return false },
    Mul({left,right}){ return false}
})
```

Then at some point complect the data and traits together:

```js
const mulExp = complect(mulExpData, {evaluate: evalMul, print: printMul, isValue}),
    {Mul} = mulExp
```

Not that complecting the data and traits together is not necessary, but it is useful for creating a single object that can be passed around. It also enables the use of traits
as methods.

## Future Work

- A TypeScript version is in progress
- Utility traits are being investigated. (fold, unfold, and combinations thereof)

## References and Further Reading

- [Expression Problem - Wikipedia](https://en.wikipedia.org/wiki/Expression_problem)
- [From Object Algebras to Finally Tagless Interpreters - Oleksandr Manzyuk](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/)
- [Extensibility for the Masses - Bruno C. d. S. Oliveira and William R. Cook](https://www.cs.utexas.edu/~wcook/Drafts/2012/ecoop2012.pdf)
- [Algebraic Data Types in JavaScript - Sjoerd Visscher](http://w3future.com/weblog/stories/2008/06/16/adtinjs.xml)
