# Brevity

Brevity is a library that enables Feature Oriented Programming (FOP) and solves the expression problem
in a manner that makes data and operation declarations trivial to define and compose.

## Installation

```text
npm install github:mlhaufe/brevity#v0.2.1
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
[From Object Algebras to Finally Tagless Interpreters](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/). The current library Brevity is another approach.

Here is how the above would be approached:

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
const add = Add({left: Lit({value: 1}, right: Lit({value: 3}))})

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

## Examples

Additional examples are available in the 'tests' folder.

## Future Work

- A TypeScript version is in progress
- Utility traits are being investigated. (fold, unfold, and combinations thereof)

## References and Further Reading

- [Expression Problem - Wikipedia](https://en.wikipedia.org/wiki/Expression_problem)
- [From Object Algebras to Finally Tagless Interpreters - Oleksandr Manzyuk](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/)
- [Extensibility for the Masses - Bruno C. d. S. Oliveira and William R. Cook](https://www.cs.utexas.edu/~wcook/Drafts/2012/ecoop2012.pdf)
- [Algebraic Data Types in JavaScript - Sjoerd Visscher](http://w3future.com/weblog/stories/2008/06/16/adtinjs.xml)
