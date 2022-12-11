# Brevity

Brevity is a library that enables Feature Oriented Programming (FOP) via Object Algebras

## Installation

## The Expression Problem

## Object Algebras

## Examples

### Boolean Algebra

Declare the Algebra:

```js
class BoolAlg extends Algebra {
    False() { }
    True() { }
}
```

Declare data and associated factory:

```js
class BoolData { }
class False extends BoolData { }
class True extends BoolData { }

class BoolFactory extends BoolAlg {
    False() { return new False() }
    True() { return new True() }
}
```

Declare traits:

```js
class BoolAnd extends BoolAlg {
    False() {
        return { and(other) { return this } }
    }
    True() {
        return { and(other) { return other } }
    }
}

class BoolOr extends BoolAlg {
    False() {
        return { or(other) { return other } }
    }
    True() {
        return { or(other) { return this } }
    }
}

class BoolNot extends BoolAlg {
    False() {
        return { not() { return new True() } }
    }
    True() {
        return { not() { return new False() } }
    }
}
```

Merge into single declaration and use:

```js
const Bool = BoolFactory.Merge(BoolAnd, BoolOr, BoolNot),
      b = new Bool()

b.False().and(b.False()) // b.True()
b.True().or(b.False()) // b.False()
b.False().not() // b.True()
```

### Color Algebra

Declare Algebra:

```js
class ColorAlgebra extends Algebra {
    Red() { }
    Green() { }
    Blue() { }
}
```

Declare data and associate factory:

```js
class ColorData { }
class Red extends ColorData { }
class Green extends ColorData { }
class Blue extends ColorData { }

class ColorFactory extends ColorAlgebra {
    Red() { return new Red() }
    Green() { return new Green() }
    Blue() { return new Blue() }
}
```

Declare trait:

```js
class Printable extends ColorAlgebra {
    Red() {
        return { print() { return '#FF0000' } }
    }
    Green() {
        return { print() { return '#00FF00' } }
    }
    Blue() {
        return { print() { return '#0000FF' } }
    }
}
```

Combine and use:

```js
const Color = ColorFactory.Merge(Printable),
    const color = new Color()

color.Red() instanceof Red // true
color.Red() instanceof ColorData // true

color.Red().print() // '#FF0000'
```

## References and Further Reading
