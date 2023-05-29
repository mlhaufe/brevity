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

## Usage

For the impatient, here is a quick example of how to use Brevity:

```js
// declare a data family
const PointData = data({
    Point2: { x: Number, y: Number },
    Point3: { x: Number, y: Number, z: Number }
});

// declare operations on the data family
const Printable = trait('print', {
    Point2({ x, y }) { return `Point2(${x}, ${y})` },
    Point3({ x, y, z }) { return `Point3(${x}, ${y}, ${z})` }
})

const Scaleable = trait('scale', {
    Point2({ x, y }, factor) { return Point2(x * factor, y * factor) },
    Point3({ x, y, z }, factor) { return Point3(x * factor, y * factor, z * factor) }
})

// complect the data and operations together
const Point = complect(pointData, [Printable, Scaleable])

// use the complected family:

const { Point2, Point3 } = Point()

const p2 = Point2({ x: 3, y: 2 }),
    p3 = Point3({ x: 12, y: 37, z: 54 })

p2.print() // 'Point2(3, 2)'
p3.scale(2) // Point3(24, 74, 108)
```

## Motivation

The motivation for Brevity was to overcome the limitation of Object-Oriented Programming (OOP) and Functional Programming (FP) in regards to the expression problem. Additionally to eliminate the overhead of boilerplate code that is required to declare a collection of related classes and operations.

### The Expression Problem

#### Description

The expression problem is a term used in computer science to describe a particular design problem that arises when a programming language or system provides ways to extend the system in two separate, but related, ways. The two ways in which the system can be extended are:

Adding new data types: This involves defining new data types and adding operations on them.

Adding new operations: This involves defining new operations that can be applied to existing data types.

The expression problem arises when it is not possible to add new data types and new operations in a way that is both easy to use and efficient. In particular, it can be difficult to add new operations if the system is not designed to accommodate them, and it can be difficult to add new data types if the system does not provide sufficient support for them.

#### Functional

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

#### Object-Oriented

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

#### Solutions

There are several approaches to solving the expression problem,
[From Object Algebras to Finally Tagless Interpreters](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/).

Here is how the above would be approached with Brevity:

```js
// data declaration
const ExpData = data({ 
    Lit: { value: {} }, 
    Add: { left: {}, right: {} }
})

// operations
const EvalTrait = trait('evaluate', {
    Lit({value}){ return value },
    Add({left, right}){
        return left.evaluate() + right.evaluate()
    }
})

const PrintTrait = trait('print', {
    Lit({value}) { return `${value}` },
    Add({left, right}) {
        return `${left.print()} + ${right.print()}`
    }
})
```

Usage:

```js
const Exp = complect(expData, [EvalTrait, PrintTrait]),
    {Add, Lit} = Exp()

// 1 + 3
const add = Add(Lit(1), Lit(3))

add.evaluate() // 4

add.print() // "1 + 3"
```

Adding a new data type `Mul` is as simple as extending the base data type:

```js
const MulExpData = data(Exp, {
    Mul: { left: {}, right: {} }
})
```

To extend `evaluate` and `print` simply extend the existing traits or the
complected object:

```js
const EvalMulTrait = trait(Exp, 'evaluate', {
    Mul({left,right}){ return left.evaluate() * right.evaluate() }
})

const PrintMulTrait = trait(Exp, 'print', {
    Mul({left,right}){ return `${left.print()} * ${right.print()}` }
})
```

Adding a new operation for all data declarations thus far `isValue`:

```js
const IsValueTrait = trait('isValue', {
    Lit({value}) { return true },
    Add({left,right}) { return false },
    Mul({left,right}){ return false}
})
```

Then at some point complect the data and traits together:

```js
const MulExp = complect(MulExpData, [EvalMulTrait, PrintMulTrait, IsValueTrait]),
    {Add, Lit, Mul} = MulExp()
```

## Data

### Enumerated data

Enumerations can be declared similar to how you would in a functional language:

```js
const ColorData = data({ Red: {}, Green: {}, Blue: {} });
```

Variants without properties are considered singletons:

```js
const {Red, Green, Blue} = ColorData()

const red = colorData.Red,
    red2 = colorData.Red

red === red2
```

Each variant can have properties. These properties become named parameters of each constructor:

```js
const PointData = data({
        Point2: {x: {}, y: {}},
        Point3: {x: {}, y: {}, z: {}} 
    }),
    {Point2, Point3} = PointData()

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
const PointData = data({
    Point2: { x: Number, y: Number },
    Point3: { x: Number, y: Number, z: Number }
}),
{ Point2, Point3 } = PointData();

// TypeError: Guard mismatch on property 'y'. Expected: Number, got: "2"
Point2(1, '2') 
```

Recursive forms are also supported:

```js
// Recursive guard:
const PeanoData = data(() => ({
    Zero: {},
    Succ: { pred: PeanoData }
})),
{ Zero, Succ } = PeanoData();

const z = Zero,
    one = Succ(z),
    two = Succ(one)

// TypeError: Guard mismatch on property 'pred'. Expected: TypeRecursion, got: 1
Succ(1)
```

If there are additional parameters:

```js
// Parameterized recursive guard:
const ListData = data((T) => ({
    Nil: {},
    Cons: { head: T, tail: ListData(T) }
}));

const numListData = ListData(Number),
    { Nil, Cons } = numListData;

// [1, 2, 3]
const xs = Cons(1, Cons(2, Cons(3, Nil)))

// [1, 2, '3']
const ys = Cons(1, Cons(2, Cons('3', Nil)))
// TypeError: Guard mismatch on property 'head'. Expected: Number, got: "3"
```

Note that in `ListData(Number)` it does not require the self reference as an explicit argument.

### Derived properties

Data definitions support the declaration of derived fields with an optional `guard`:

```js
const { Employee } = data({
    Employee: {
        firstName: String,
        lastName: String,
        fullName: {
            guard: String, // Optional
            get() { return `${this.firstName} ${this.lastName}` }
        }
    }
})

const johnDoe = Employee({
    firstName: 'John',
    lastName: 'Doe'
    // Note that fullName is not specified and cannot be set
})

johnDoe.fullName === 'John Doe'
```

The derived field is evaluated only once and cached for future access.

### Destructuring

Variants support both object and array destructuring:

```js
const disk = Disk({ position: [0, 0], velocity: [1, 3], radius: 1, item: 'apple' });

const [position, velocity, radius, item] = disk;

const { position, velocity, radius, item } = disk;
```

### Extending Data

Data declarations can be extended by passing the base data declaration as the first argument to `data`:

```js
const IntExp = data({ 
    Lit: { value: {} }, 
    Add: { left: {}, right: {} }
})

const IntBoolExp = data(IntExp, {
    Bool: { value: {} }, 
    Iff: { pred: {}, ifTrue: {}, ifFalse: {}}  
}),
    {Add, Lit, Bool, Iff} = IntBoolExp()

// if (true) 1 else 1 + 3
const exp = Iff( Bool(true), Lit(1), Add(Lit(1), Lit(3)) )
```

### Lazy fields

`data` supports lazy fields via passing a function to the instance constructor which becomes a getter for that field:

```js
const {Employee} = data({
    Employee: {firstName: String, lastName: String, fullName: String}
})()

const p = Employee({
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
    { Alt, Empty, Cat, Char } = Lang()

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
const {Point2, Point3} = data({ 
    Point2: {x: Number, y: Number},
    Point3: {x: Number, y: Number, z: Number} 
})()

Point3(1,2,3) === Point3({x:1, y:2, z:3}) // true
```

This enabled via [object-pooling](https://en.wikipedia.org/wiki/Object_pool_pattern) in a WeakMap behind the scenes.

Besides the convenience of the above, this also enables use of variant declarations in native JavaScript collections
directly like Array, Map, Set, etc.

```js
const { Point2, Point3 } = data({ 
    Point2: {x: Number, y: Number}, 
    Point3: {x: Number, y: Number, z: Number} 
})()

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

## Traits

A `trait` defines operations for data family and supports pattern matching.

```js
const ColorData = data({ Red: {}, Green: {}, Blue: {} });

const Printable = trait('print', {
    Red() { return '#FF0000' },
    Green() { return '#00FF00' },
    Blue() { return '#0000FF' }
})

// 'complect' combines data and traits. It will be explained later.
const Color = complect(colorData, [Printable])

const { Red, Green, Blue } = Color()

Red.print() // '#FF0000'
```

Another example on a recursive structure:

```js
const List = data((List, T) => ({ 
    Nil: {},
    Cons: { head: T, tail: List(T) } 
}));

const ConcatTrait = trait('concat', {
    Nil(_, ys) { return ys },
    Cons({ head, tail }, ys) {
        // 'this' refers to the ultimately complected family.
        return this.Cons({ head, tail: tail.concat(ys) })
    }
})

const { Nil, Cons } = List(Number)

// [1, 2]
const xs = Cons(1, Cons(2, Nil)),
    // [3, 4]   
    ys = Cons(3, Cons(4, Nil)),
    // xs ++ ys == [1, 2, 3, 4]
    zs = concat(xs, ys);
```

The first argument in each operation is 'self', the data instance on which the operation is invoked.
`this` refers to the ultimately complected family.

### Wilcard `_` trait

If the same operation should be applied to all variants, then the `_` token can be used:

```js
const StringifyTrait = trait('stringify', {
    _: (target) => JSON.stringify(target)
})
```

Note that in this case a data declaration was not provided as an argument since it's irrelevant.

A more practical example for a List:

```js
const IsNilTrait = trait('isNil', {
    _: () => false,
    Nil: () => true
});
```

In this case `Nil` takes priority over `_` and works as expected.

### Nested Pattern Matching

More advanced pattern matching is supported beyond simply variants and utilize `Symbol(_)`
as a wildcard. This is accomplished via the `Pattern` constructor:

```js
const ExpData = data({ 
    Num: {value: {}}, 
    Var: {name: {}}, 
    Mul: {left: {}, right: {}} 
})

// 1 * x = x
// x * 1 = x
// 0 * x = 0
// x * 0 = 0
const SimplifyTrait = trait('simplify', {
    _: (self) => self,
    // Pattern takes a function that returns an array of patterns.
    // $ is a shorthand for the ultimately complected family.
    Mul: Pattern(($) => [
        [$.Mul($.Num(1), _), ({ right }) => right],
        [$.Mul(_, $.Num(1)), ({ left }) => left],
        [$.Mul($.Num(0), _), ({ left }) => left],
        [$.Mul(_, $.Num(0)), ({ right }) => right]
    ])
})

const { Num, Var, Mul } = complect(expData, [SimplifyTrait])()

const e1 = Mul(Var('x'), Num(1))

e1.simplify() === Var('x')

const e2 = Mul(Num(1), Var('x'))

e2.simplify() === Var('x')

const e3 = Mul(Num(0), Var('x'))

e3.simplify() === Num(0)

const e4 = Mul(Var('x'), Num(0))

e4.simplify() === Num(0)
```

Object literals can be used as well as an alternative to using `_` :

```js
const SimplifyTrait = trait('simplify', {
    _: (self) => self,
    Mul: Pattern(($) => [
        [{ left: $.Num(1) }, ({ right }) => right],
        [{ right: $.Num(1) }, ({ left }) => left],
        [{ left: $.Num(0) }, ({ left }) => left],
        [{ right: $.Num(0) }, ({ right }) => right]
    ]
})
```

A more complicated example with nested patterns:

```js
const List = data({ Nil: {}, Cons: {head: {}, tail: {}} })

const TellTrait = trait('tell', {
    Nil: (self) => 'The list is empty',
    Cons: Pattern(($) => [
        [$.Cons(_, Nil), ({ head }) => 
            `The list has one element: ${head}`],
        [$.Cons(_, $.Cons(_, Nil)), ({ head, tail }) => 
            `The list has two elements: ${head} and ${tail.head}`],
        [$.Cons(_, $.Cons(_, _)), ({ head, tail }) => 
            `This list is long. The first two elements are: ${head} and ${tail.head}`]
    ])
})
```

A contrived way to test if a list contains the value `3`:

```js
const Contains3Trait = trait('contains3', {
    Nil: (self) => false,
    Cons: Pattern(($) => [
        [$.Cons(3, _), (self) => true],
        [$.Cons(_, _), ({ tail }) => tail.contains3()]
    ])
})
```

Pattern declarations have the following form:

```js
const TraitName = trait('methodName', {
  VariantName: Pattern((family) => [
    [pattern1, pattern2, ...patternN, (self, v2, ...vN) => {...}],
    [pattern1, pattern2, ...patternN, (self, v2, ...vN) => {...}]
  ])
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

### Calling 'super' and the `apply` symbol

There may be cases that you need to call the parent trait in the context of the current. This can be accomplished as follows using the `apply` symbol:

```js
const SubTrait = trait(ParentTrait, 'fooMethod', {
    Foo(self) { ParentTrait[apply](this, self, ...additionalArgs) }
})
```

Outside of the above use case, the `apply` symbol is rarely needed.

For reference there are two forms: a static and instance form. The static form is used when the trait is not yet complected (like in the above example). The instance form is used when the trait is already associated with a family (via `complected`).

To utilize a trait without complecting it you can do the following:

```js
const traitInstance = new SomeTrait(family)
traitInstance[apply](variant, ...additionalArgs)
```

I am not aware of any use cases for this, but it is possible.

### Breaking infinite recursion with `memoFix`

With the ability to define [self-referential fields](#lazy-fields), it's necessary to be able to
define traits that won't become stuck in infinite recursion when those fields are accessed. `memoFix` solves this problem.

Given the following contrived trait you can see that it will blow the stack when called:

```js
const NumData = data({
    Num: { n: Number }
})

const OmegaTrait = trait('omega', {
    Num({ n }) { return this.Num(n).omega(); }
})

const { Num } = complect(NumData, [OmegaTrait])

Num(2).omega() // new Error('Maximum call stack size exceeded')
```

By utilizing `memoFix` we can replace this error with a [least-fixed-point](https://en.wikipedia.org/wiki/Least_fixed_point):

```js
const OmegaFixTrait = trait('omegaFix', {
    [memoFix]: { bottom: 'bottom' },
    Num({ n }) { return this.Num(n).omegaFix(); }
})

const { Num } = complect(NumData, [OmegaFixTrait])

Num(2).omegaFix() // 'bottom'
```

A `bottom` value can also be a function which will be called with the respective arguments to determine what the bottom value should be:

```js
const FooData = data({
    Foo: { n: Number }
})

const FooFixTrait = trait('foo', {
    [memoFix]: { bottom: ({ n }) => n ** 2 },
    Foo({ n }) {
        if (n <= 3)
            return 1 + this.Foo(n + 1).foo();
        else
            return this.Foo(n).foo();
    }
})

const { Foo } = complect(FooData, [FooFixTrait])

FooFix(1).foo() === 19;
FooFix(2).foo() === 18;
FooFix(3).foo() === 17;
FooFix(4).foo() === 16;
```

The `memoFix` trait memoizes (caches) calls. If the same arguments are encountered a
second time, then the previously computed value is returned. The least-fixed-point (bottom value) is the
initial entry in this cache. So the added benefit of this is not just for tying-the-recursive-knot, but
for improving performance:

```js
const FibData = data({
    Fib: { n: Number }
})

const Evaluable = trait('evaluate', {
    Fib({ n }) {
        return n < 2 ? n : this.Fib(n - 1).evaluate() + this.Fib(n - 2).evaluate();
    }
})

const FixEvalTrait = trait('fixEval', {
    [memoFix]: { bottom: 0 },
    Fib({ n }) {
        return n < 2 ? n : this.Fib(n - 1).fixEval() + this.Fib(n - 2).fixEval();
    }
})

const { Fib } = complect(FibData, [Evaluable, FixEvalTrait])

let start, end;

start = performance.now();
Fib(40).evaluate();
end = performance.now();
const time = end - start; // ~4333ms

start = performance.now();
Fib(40).fixEval();
end = performance.now();
const memoTime = end - start; // ~0.1ms
```

## Complection

Data and associated traits can be combined into a single object via the `complect` function:

```js
const PointData = data({
    Point2: { x: Number, y: Number },
    Point3: { x: Number, y: Number, z: Number }
})

const Printable = trait('print', {
    Point2({ x, y }) { return `(${x}, ${y})` },
    Point3({ x, y, z }) { return `(${x}, ${y}, ${z})` }
})

const { Point2, Point3 } = complect(PointData, [printable])
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

If the data declaration is parameterized, like ListData, then complect will return a function that takes the parameters and returns the complected object:

```js
const ListData = data((T) => ({
    Nil: {},
    Cons: { head: T, tail: ListData(T) }
}));

const ConcatTrait = trait('concat', {
    Nil(self, ys) { return ys },
    Cons({ head, tail }, ys) {
        return this.Cons({ head, tail: tail.concat(ys) })
    }
})

const IsNilTrait = trait('isNil', {
    _: () => false,
    Nil: () => true
});

const LengthTrait = trait('length', {
    Nil(self) { return 0 },
    Cons({ head, tail }) { return 1 + tail.length() }
});

const List = complect(ListData, [ConcatTrait, IsNilTrait, LengthTrait]),
    { Nil, Cons } = List(Number);
```

### Extending complected objects

A data declaration can extend a complected object:

```js
const Point4Data = data(PointData, {
    Point4: { x: Number, y: Number, z: Number, w: Number }
})
```

A trait declaration can also extend a complected object:

```js
const Point4Printable = trait(Point, {
    Point4({ x, y, z, w }) { return `(${x}, ${y}, ${z}, ${w})` }
})
```

## Future Work

- A TypeScript version is in progress
- Utility traits are being investigated. (fold, unfold, and combinations thereof)

## References and Further Reading

- [Expression Problem - Wikipedia](https://en.wikipedia.org/wiki/Expression_problem)
- [From Object Algebras to Finally Tagless Interpreters - Oleksandr Manzyuk](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/)
- [Extensibility for the Masses - Bruno C. d. S. Oliveira and William R. Cook](https://www.cs.utexas.edu/~wcook/Drafts/2012/ecoop2012.pdf)
- [Algebraic Data Types in JavaScript - Sjoerd Visscher](http://w3future.com/weblog/stories/2008/06/16/adtinjs.xml)
