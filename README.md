# Brevity

Brevity is a library that enables Feature Oriented Programming (FOP)

## Data

### Enumerated Data

Data declarations can be made by enumerating alternatives. A couple examples:

```js
const Color = Data({ Red: {}, Green: {}, Blue: {} })

const red = Color.Red

const Day = Data({ Sun: {}, Mon: {}, Tue: {}, Wed: {}, Thu: {}, Fri: {}, Sat: {} })

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

When the value of the property is a function, it will be used for validation when assignment is performed.

```js
const badPoint = Point.Point2({ x: 12, y: 'foo' }) // throws on 'foo'
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
