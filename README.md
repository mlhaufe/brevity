# Brevity

Brevity is a library that enables Feature Oriented Programming (FOP)

## Data

### Enumerated Data

Data declarations can be made by enumerating alternatives. A couple examples:

```js
const Color = Data({ Red: {}, Green: {}, Blue: {} })

const red = Color.Red
```

```js
const Day = Data({
    Sun: {}, Mon: {}, Tue: {}, Wed: {}, Thu: {}, Fri: {}, Sat: {} 
})

const thursday = Day.Thu
```

Variants without attributes are singletons and have the following additional properties:

```js
red === Color.Red
red instanceof Color
```

### Composite Data

Data declarations that have properties can also be defined.

```js
const Point = Data({
    Point2: { x: Number.isFinite, y: Number.isFinite },
    Point3: { x: Number.isFinite, y: Number.isFinite }
})

const pt2 = Point.Point2({ x: 12, y: 74 }),
      pt3 = Point.Point3({ x: 44, y: 19, z: 187 })
```

When the variant declaration property is a function, such as `Number.isFinite` in the above, it will be used as a guard when assignment is performed or when an instance is constructed:

```js
const badPoint = Point.Point2({ x: 12, y: 'foo' }) // throws on y: 'foo'
```

Alternatively Constructors can be used. In these cases a `instanceof` check is performed. In the below example `color: Color` is such a declaration:

```js
const Color = Data({ Red: {}, Green: {}, Blue: {} });

const ColorPoint = Data({
    Pt: { x: Number.isFinite, y: Number.isFinite, color: Color }
})
```

### Recursive Data

Some data is recursive in its form such as [Peano numbers](https://www.britannica.com/science/Peano-axioms).
Such recursive structures can be defined by using a lambda:

```js
const Peano = Data(({self}) => ({
    Zero: {},
    Succ: { pred: self }
}))

const zero = Peano.Zero,
      one = Peano.Succ({ pred: zero }),
      two = Peano.Succ({ pred: one }),
      three = Peano.Succ({ pred: two })

two instanceof Peano.Succ //true
two instanceof Peano //true
two.pred === one //true
```

Recursive definitions can also be parameterized. An example is a Linked List:

```js
const List = Data(({self, ofType}) => ({
    Nil: {},
    Cons: { head: ofType, tail: self }
}))
```

By having the additional variable defined `ofType`, the data constructor now accepts this during
construction (note that `self` is implicit).

```js
const IntList = List({ ofType: Number.isInteger }),
    // [0,2,4]
    evens = IntList.Cons({
        head: 0,
        tail: IntList.Cons({
            head: 2, 
            tail: IntList.Cons({
                head: 4,
                tail: IntList.Nil
            })
        })
    })

evens.head = -2 //
evens.head = 'F' // throws

// ['A',-2, 2, 4]
const badList = IntList.Cons({ head: 'A', tail: evens}) // throws on head: 'A'
```

```js
const BoolList = List({ ofType: (x) => !!x }),
    // [true, false, true]
    bs = BoolList.Cons({
        head: true,
        tail: BoolList.Cons({
            head: false,
            tail: BoolList.Cons({
                head: true,
                tail: BoolList.Nil
            })
        })
    })

bs.tail.head = true // okay
bs.tail.head = 13 // throws

// [94, true, true, true]
const badBoolList = IntList.Cons({ head: 94, tail: evens}) // throws on head: 94
```

### Declaration Invariants

Each variant must start with a capital letter as they are considered constructors:

```js
// throws
const BadColor = Data({ red: {}, green: {}, blue: {} })

// okay
const GoodColor = Data({ Red: {}, Green: {}, Blue: {} })
```

Only object literals can be used when defining each invariant:

```js
const Color = Data({ Red: {}, Green: {}, Blue: {}, Other: 17 }) // throws on 'Other'
```

### Open-Closed Principle

Data declarations and variant constructors are [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze). They can not be modified nor extended directly:

```js
const Color = Data({ Red: {}, Green: {}, Blue: {} }),
    red = Color.Red

Color.Red = 'foo' // throws
Color.Blue = {} // throws
delete Color.Red // throws
red.value = '#FF0000' // throws
```

## References and Further Reading

- <https://en.wikipedia.org/wiki/Feature-oriented_programming>
- <https://en.wikipedia.org/wiki/FOSD_program_cubes#Applications>
- <https://en.wikipedia.org/wiki/Expression_problem>
- <http://w3future.com/weblog/stories/2008/06/16/adtinjs.xml>
- [
From Object Algebras to Finally Tagless Interpreters](https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/)
