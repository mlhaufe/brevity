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


===============
/*
    Visitor Pattern <https://en.wikipedia.org/wiki/Visitor_pattern>
        Church encoding – a related concept from functional programming, 
        in which tagged union/sum types may be modeled using the behaviors
        of "visitors" on such types, and which enables the visitor pattern
        to emulate variants and patterns.

    Object Algebra
        a class that implements a generic abstract factory interface,
        which corresponds to a particular kind of algebraic signature.
        Object algebras are closely related to the Abstract Factory, 
        Builder and Visitor patterns
        inspired by earlier work on the relation between Church encodings
        and the Visitor pattern
        An important advantage of object algebras over traditional visitors
        is that there is no need for accept methods
        Rather than creating generic objects and then visiting them to perform
        operations, object algebras encourage that object creation is done relative to a
        factory, so that specialized factories can be defined to create objects with the
        required operations in them.
        In some sense, factories and visitors are two faces of object algebras.

    https://en.wikipedia.org/wiki/Church_encoding

    Algebraic Signature Σ
        defines the names and types of functions that operate over one or 
        more abstract types, called sorts.
    
        signature E
            lit:  Int  -> E
            Add: E x E -> E

        General algebraic signature can contain constructors that return values of
        the abstract set, as well as observations that return other kinds of values.
        signatures that only contain constructors are called constructive

        An Σ-algebra is a set together with a collection of functions whose type is
        specified in the signature Σ

        When interpreted in object-oriented programming, Church encodings correspond
        to internal visitors [5, 35]. From a functional programming point of view,
        Church encodings represent data as folds [15].

        <https://www.cs.ox.ac.uk/people/bruno.oliveira/Visitor.pdf>
        In their presentation of the VISITOR pattern, Gamma et al.
        [1995] raise the question of where to place the traversal
        code: in the object structure itself (in the accept methods),
        or in the concrete visitors (in the visit methods). Buchlovsky
        and Thielecke [2005] use the term internal visitor for the
        former approach, and external visitor for the latter. Internal
        visitors are simpler to use and have more interesting algebraic 
        properties, but the fixed pattern of computation makes
        them less expressive than external visitors.


        but what of the dual? If a fold is an inernal visitor and a Church Encoding
        what does an unfold correspond to?
            Scott Encoding? <https://en.wikipedia.org/wiki/Mogensen%E2%80%93Scott_encoding>
                            <https://www.reddit.com/r/haskell/comments/54h33m/scott_encoding/>
        
            data List a = Nil | Cons a (List a)
            newtype List a = List { uncons ::  forall r. (a -> List a -> r) -> r -> r }

 */