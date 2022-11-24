export type Constructor<T> = new (...args: any[]) => T;

type TupleToUnion<T extends any[]> = T[number];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type Data<T extends Record<string, Record<string, any>>> = {
    [K in NonFunctionPropertyNames<T>]: keyof T[K] extends never ?
        () => T[K] :
        (args: {[J in NonFunctionPropertyNames<T[K]>]: T[K][J]}) => NonFunctionProperties<T[K]>
};

<http://localhost:4000/types-and-programming-languages/feature-oriented-programming-in-javascript>
<http://w3future.com/weblog/stories/2008/06/16/adtinjs.xml>
<https://oleksandrmanzyuk.wordpress.com/2014/06/18/from-object-algebras-to-finally-tagless-interpreters-2/>
file:///C:/Users/micha/OneDrive%20-%20thenewobjective/Documents/Computer%20Science/Self%20Language/Attack%20of%20the%20Clones.pdf
<https://gbracha.blogspot.com/2018/10/reified-generics-search-for-cure.html>
file:///C:/Users/micha/OneDrive%20-%20thenewobjective/Documents/Computer%20Science/Self%20Language/SELF%20The%20Power%20of%20Simplicity.pdf
file:///C:/Users/micha/OneDrive%20-%20thenewobjective/Documents/Computer%20Science/Object%20Algebras/Feature-Oriented%20Programming%20with%20Object%20Algebras.pdf
<https://www.google.com/search?q=%22self%20language%22%20design%20pattern>
<https://wiki.ralfbarkow.ch/view/prototype-based-programming>
file:///C:/Users/micha/OneDrive%20-%20thenewobjective/Documents/Computer%20Science/Self%20Language/Attack%20of%20the%20Clones.pdf

/*

/////////////////////////////

let product = List.reduce({
    Nil: 1,
    Cons: ({ head, tail }) => head * tail
})

product(Counter({ value: 5 })) // 120

/////////////////////////////

let factorial = Counter.merge(product)

factorial(5) // 120

///////////////

let id = (t) => t

let addPrefix = XNode.map(({ name }) => `x: ${name}`, id)

let normalizeSpace = XNode.map(id, ({ value }) => value.trim())

//////////////////

let serialize = XNode.reduce({
    Elem: ({ name, attrs, children }) => `<${name} ${attrs}>${children}</${name}>`,
    Text: ({ value }) => value,
    Attr: ({ name, value }) => `${name}='${value}'}`,
    Cons: ({ head, tail }) => `${head}${tail}`,
    Nil: ""
})

let { Elem, Text } = XNode,
    { Attr } = Attrs,
    { Cons, Nil } = List

let xml = Elem({
    name: "test",
    attrs: Nil,
    children: Cons({
        head: Elem({
            name: "hoi",
            attrs: Cons({
                head: Attr({name: "href", value: "w3future.com"}),
                tail: Nil
            }),
            children: Nil
        }),
        tail: Cons({
            head: Text({value: "bla"}),
            tail: Cons({
                head: Elem({name: "doei", attrs: Nil, tail: Nil}),
                tail: Nil
            })
        })
    })
})

serialize(normalizeSpace(addPrefix(xml)))
// "<x:test><x:hoi x:href='w3future.com'></x:hoi>bla<x:doei></x:doei></x:test>"

let prefixNormalizeAndSerialize = addPrefix.merge(normalizeSpace).merge(serialize)
prefixNormalizeAndSerialize(xml)
// "<x:test><x:hoi x:href='w3future.com'></x:hoi>bla<x:doei></x:doei></x:test>"

///////////////////////////////////////////////

const expData = data({
    Lit: { value: 0 },
    Add: { left: null, right: null }
})

console.log(expData.Lit({value: 12}))

const expEval = trait({
    Lit() { return this.value },
    Add() { return this.left + this.right }
})

const expToString = trait({
    Lit() { return `${this.value}` },
    Add() { return `${this.left} + ${this.right}` }
})

// used like a function as well as a method?
// expToString(expData.Lit({value: 0}))

const exp = def({
    data: expData,
    traits: {
        toString: expToString,
        eval: expEval
    }
})

const seven = exp.Add({
    left: expData.Lit({ value: 5 }),
    right: expData.Lit({ vale: 2 })
}).evaluate()

const strSeven = seven.toString()

const expMulData = data({
    extend: expData,
    Mul: { left: null, right: null }
})

const expMulEval = trait({
    extend: expEval,
    Mul() { return this.left * this.right }
})

const expMulToString = trait({
    extend: expToString,
    Mul() { return `${this.left} * ${this.right}` }
})

const exp2 = def({
    extend: exp,
    data: expMulData,
    trait: [expMulEval, expMulToString]
})

const colorToString = trait({
    Red() { return 'red' },
    Green() { return 'green' },
    Blue() { return 'blue' }
})

const pointData = data({
    Point2: { x: 0, y: 0 },
    Point3: { x: 0, y: 0, z: 0 }
})

const pointToString = trait({
    Point2() { return `(${this.x},${this.y})` },
    Point3() { return `(${this.x},${this.y},${this.z})` }
})

const attrData = data({
    Attr: {name: "", value: "" }
})

const nodeData = data({
    Elem: { name: "", attrs: listData.Nil, childNodes: listData.Nil },
    Text: { value: "" }
})

const serialize = nodeData.reduce({
    Elem() { return `<${this.name} ${this.attrs.}></${this.name}>`},
    Text() { return this.value }
})

// FIXME
const Counter = List.generate((n, self) => n > 0 ? self.Cons({head: n, tail: n -1}) : self.Nil)

Counter(3)

// Cons({ head: 3, tail: Cons({ head: 2, tail: Cons({ head: 1, tail: Nil }) }) })

const product = List.reduce({
    Nil(){ return 1 },
    Cons(){ return this.head * this.tail }
})

const factorial = Counter.merge(product)

factorial(5) // 120
*/
