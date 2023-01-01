# Brevity

Brevity is a library that enables [Feature-Oriented Programming (FOP)](https://en.wikipedia.org/wiki/Feature-oriented_programming) and solves the expression problem
in a manner that makes data and operation declarations trivial to define and compose.

## Installation

The latest version:

```text
npm install github:mlhaufe/brevity
```

A specific version:

```text
npm install github:mlhaufe/brevity#v0.2.5
```

## Data

### Enumerated data

Enumerations can be declared similar to how you would in a functional language:

```js
const Color = Data({ Red: [], Green: [], Blue: [] });
```

Variants without properties are considered singletons:

```js
const red = Color.Red,
    red2 = Color.Red

red === red2
```

Each variant can have properties. These properties become named parameters of each constructor:

```js
const Point = Data({ Point2: ['x', 'y'], Point3: ['x', 'y', 'z'] }),
    {Point2, Point3} = Point

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

### `typeName` symbol

Each data variant has a `[typename]` field which provides the name of the variant:

```js
const Color = Data({ Red: [], Green: [], Blue: [] });

Color.Red[typeName] === 'Red'

const Point = Data({ Point2: ['x', 'y'], Point3: ['x', 'y', 'z'] }),
    {Point2, Point3} = Point

const p2 = Point2(12, 3),
      p3 = Point3(184, 13, 56)

p2[typeName] === 'Point2'
p3[typeName] === 'Point3'
```

### Recursive Data

Recursive data can be defined as follows:

```js
const Peano = Data({ Zero: [], Succ: ['pred'] });

const zero = Peano.Zero,
      one = Peano.Succ({ pred: zero }),
      two = Peano.Succ({ pred: one }),
      three = Peano.Succ({ pred: two });

const List = Data({ Nil: [], Cons: ['head', 'tail'] }),
    { Cons, Nil } = List;

// [1, 2, 3]
const xs = Cons(1, Cons(2, Cons(3, Nil))),
```

### Extending Data

Data declarations can be extended by passing the base declaration as the first argument:

```js
const IntExp = Data({ Lit: ['value'], Add: ['left', 'right'] })

const IntBoolExp = Data(IntExp, { Bool: ['value'], Iff: ['pred', 'ifTrue', 'ifFalse'] }),
    {Add, Lit, Bool, Iff} = IntBoolExp

// if (true) 1 else 1 + 3
const exp = Iff({
    pred: Bool({ value: true }),
    ifTrue: Lit({ value: 1 }),
    ifFalse: Add({left: Lit({value: 1}, right: Lit({value: 3}))})
})
```

### Lazy fields

`Data` supports lazy fields via passing a function to the instance which becomes a getter for that field:

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

This can also be used for self-referential structures:

```js
const Lang = Data({
    Alt: ['left', 'right'],
    Cat: ['first', 'second'],
    Char: ['value'],
    Empty: [],
}),
    { Alt, Empty, Cat, Char } = Lang

// balanced parentheses grammar
// S = S ( S ) ∪ ε
const S = Alt(Cat(() => S, Cat(Char('('), Cat(() => S, Char(')')))), Empty)

S[typeName] === 'Alt'
S.left[typeName] === 'Cat'
S.left.first === S
```

## Traits

A `Trait` associates operations with data declarations and supports pattern matching.

```js
const print = Trait({
    Red() { return '#FF0000' },
    Green() { return '#00FF00' },
    Blue() { return '#0000FF' }
})

print(Color.Red) // '#FF0000'
```

The trait `print` is a function that can then be applied to data instances.

```js
const concat = Trait({
    Nil({ }, ys) { return ys },
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

### `all` symbol

If the same operation should be applied to all variants, then the `all` symbol can be used:

```js
const operation = Trait({
    [all](target){ return JSON.stringify(target) }
})
```

### Extending Traits

Like the `Data` declaration one `Trait` can extend another:

```js
const baseTrait = Trait({
    Foo(){ ... }
})

const subTrait = Trait(baseTrait, {
    Bar() { ... }
})
```

`subtrait` can now be applied to both `Foo` and `Bar` instances.

### Open Recursion

A trait may need to be applied to data definitions that have not yet been defined. A solution to this problem
is [Open Recursion](http://journal.stuffwithstuff.com/2013/08/26/what-is-open-recursion/). In OOP,
this is provided by the variable `this` or similar. In a Featured-Oriented approach like this library a
different mechanism is needed as the recursion happens across a data family and its independently defined traits.

Instead of `this`, the `apply` symbol is used:

```js
const IntExp = Data({ Lit: ['value'], Add: ['left', 'right'] })

const intPrint = Trait({
    Lit({ value }) {
        return value.toString()
    },
    Add({ left, right }) {
        return `(${this[apply](left)} + ${this[apply](right)})`
    }
})

const IntBoolExp = Data(IntExp, { Bool: ['value'], Iff: ['pred', 'ifTrue', 'ifFalse'] })

const intBoolPrint = Trait(intPrint, {
    Bool({ value }) { return value.toString() },
    Iff({ pred, ifTrue, ifFalse }) {
        return `(${this[apply](pred)} ? ${this[apply](ifTrue)} : ${this[apply](ifFalse)})`
    }
})
```

Above `this[apply]` is called instead of `intPrint` or `intBoolPrint`. This is necessary as an
expression can be constructed arbitrarily. For instance, if `Add.left` was a `Bool` then `intPrint`
would fail as there is no definition for that pattern. Additionally, data and traits could be extended
indefinitely, such as by adding `Mul` and `intMulPrint` and so on. Given that you don't know and shouldn't
care about such extensions, relying on open recursion is key.

### Calling 'super'

There may be cases that you need to call the parent trait in the context of the current. This can be accomplished as follows:

```js
const someTrait = Trait(parentTrait, {
    Foo(self) {
        // ...
        parentTrait[apply].call(this, self)
    }
})
```

### Breaking infinite recursion with `memoFix`

With the ability to define [self-referential fields](#lazy-fields), it's necessary to be able to
define traits that won't become stuck in infinite recursion when those fields are accessed. The `memoFix`
trait solves this problem.

Given the following contrived trait you can see that it will blow the stack when called:

```js
const omega = new Trait({
    [apply](x) { return this[apply](x); }
})

omega('x') // new Error('Maximum call stack size exceeded')
```

By utilizing `memoFix` we can replace this error with a [least-fixed-point](https://en.wikipedia.org/wiki/Least_fixed_point):

```js
const omegaFix = memoFix(omega, 'bottom');

omegaFix('x') === 'bottom'
```

The `bottom` argument can also be a function which will be called with the respective arguments to determine
what the bottom value should be:

```js
const foo = Trait({
    [apply](x) {
        if (x <= 3) {
            return 1 + this[apply](x + 1);
        } else {
            return this[apply](x);
        }
    }
})

foo(1) // new Error('Maximum call stack size exceeded')

const fooFix = memoFix(foo, (x) => x ** 2)

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
const fib = new Trait({
    [apply](n) {
        return n < 2 ? n : this[apply](n - 1) + this[apply](n - 2);
    }
})

const fibFix = memoFix(fib);

let start, end;

start = performance.now();
fib(40);
end = performance.now();
const time = end - start; // ~4333ms

start = performance.now();
fibFix(40);
end = performance.now();
const memoTime = end - start; // ~5ms
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

Adding a new Data type: `Mul(left, right)` is easy to do in OO style, just create a new class.

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
const Exp = Data({ Lit: ['value'], Add: ['left', 'right']})

// operations
const evaluate = Trait({
    Lit({value}){ return value },
    Add({left, right}){
         return this[apply](left) + this[apply](right)
    }
})

const print = Trait({
    Lit({value}) { return `${value}` },
    Add({left, right}) {
        return `${this[apply](left)} + ${this[apply](right)}`
    }
})
```

Usage:

```js
const {Add, Lit} = Exp

// 1 + 3
const add = Add(Lit(1), Lit(3))

evaluate(add) // 4
print(add) // "1 + 3"
```

Adding a new data type `Mul` is as simple as extending the base data type `Exp`:

```js
const MulExp = Data(Exp, { Mul: ['left','right']})
```

To extend `evaluate` and `print` to the new data declaration, simply extend the existing traits:

```js
const evalMul = Trait(evaluate, {
    Mul({left,right}){ return this[apply](left) * this[apply](right) }
})

const printMul = Trait(print, {
    Mul({left,right}){ return `${this[apply](left)} * ${this[apply](right)}` }
})
```

Adding a new operation for all data declarations thus far `isValue`:

```js
const isValue = Trait({
    Lit({value}) { return true },
    Add({left,right}) { return false },
    Mul({left,right}){ return false}
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
