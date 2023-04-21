import { callable } from "./callable.mjs";
import { Data } from "./data.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";

export class Complected { }

/**
 * Combines a data declaration with traits
 * @param {object} dataDecl - The data declaration
 * @param {Record<PropertyKey,object>} traits - The trait configuration
 * @returns {object} - The complected data type
 */
export const complect = (dataDecl, traits) => {
    if (!(dataDecl instanceof Data))
        throw new TypeError('Data declaration must be a Data object')
    if (!isObjectLiteral(traits))
        throw new TypeError('Traits must be an object literal')

    class ComplectedFactory extends Complected {
        static {
            for (let consName in dataDecl) {
                const Cons = dataDecl[consName]
                const ComplectedVariant = callable(class extends ComplectedFactory {
                    static {
                        Object.assign(this.prototype, traits)
                        Object.defineProperty(this, 'name', { value: consName });
                    }
                    constructor(...args) {
                        super()
                        Object.assign(this, new Cons(...args))
                    }
                })

                this[consName] = typeof Cons === 'function' ? ComplectedVariant : ComplectedVariant()
            }
        }
    }

    return new ComplectedFactory()
}

// /**
//  * Intercepts the call to the trait method and passes the self object as the first argument
//  * @param {*} factory - The factory object
//  * @param {*} trait - The trait object
//  */
// const decorateSelf = (vName, factory, trait) => {
//     return new Proxy(trait, {
//         get(target, prop, receiver) {
//             const maybeTrait = Reflect.get(target, prop, receiver);

//             if (isTrait(maybeTrait)) {
//                 if (!(vName in maybeTrait) && !('_' in maybeTrait))
//                     throw new Error(`Trait ${maybeTrait(prop)} does not have a variant ${vName}`)
//                 // makes 'this' refer to the family and the first argument refer to the data instance (self)
//                 return (maybeTrait[vName] ?? maybeTrait['_']).bind(factory, receiver)
//             } else {
//                 return maybeTrait
//             }
//         }
//     })
// }

/*
function getDesc(obj, prop) {
    const desc = Object.getOwnPropertyDescriptor(obj, prop);
    return desc || (obj = Object.getPrototypeOf(obj) ? getDesc(obj, prop) : void 0);
}

const merge = (...protos) => {
    let parents = protos
    return Object.create(new Proxy(Object.create(null), {
        has: (target, prop) => parents.some(obj => prop in obj),
        get(target, prop, receiver) {
            const obj = parents.find(obj => prop in obj);
            return obj ? Reflect.get(obj, prop, receiver) : void 0;
        },
        set(target, prop, value, receiver) {
            const obj = parents.find(obj => prop in obj);
            return Reflect.set(obj || Object.create(null), prop, value, receiver);
        },
        ownKeys(target) {
            const hash = Object.create(null);
            for (let obj of parents) for (let p in obj) if (!hash[p]) hash[p] = true;
            return Object.getOwnPropertyNames(hash);
        },
        getOwnPropertyDescriptor(target, prop) {
            const obj = parents.find(obj => prop in obj);
            const desc = obj ? getDesc(obj, prop) : void 0;
            if (desc) desc.configurable = true;
            return desc;
        },
        getPrototypeOf(target) { return parents },
        setPrototypeOf(target, protoArray) {
            // @ts-ignore
            parents = protoArray
            return true
        },
        deleteProperty(target, property) { return parents.some(p => delete p[target]) },
        isExtensible(target) { return parents.every(p => Reflect.isExtensible(p)) },
        preventExtensions: (target) => false,
        defineProperty: (target, prop, desc) => false,
    }));
}

*/