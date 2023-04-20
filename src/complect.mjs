import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { isTrait } from "./index.mjs";

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

/**
 * Combines a data declaration with traits
 * @param {object} dataDecl - The data declaration
 * @param {Record<PropertyKey,object>} traits - The trait configuration
 * @returns {object} - The complected data type
 */
export const complect = (dataDecl, traits) => {
    const constructorPool = new BoxedMultiKeyMap();
    let initTraits = traits
    const merged = new Proxy({}, {
        get(target, prop, receiver) {
            const cached = constructorPool.get(dataDecl, prop, receiver);
            if (cached) return cached;

            //const VCons = Reflect.get(target, prop, receiver);
            const VCons = Reflect.get(dataDecl, prop, receiver);
            if (typeof VCons === 'function') {
                const fnResult = function (...args) {
                    const vt = VCons(...args)

                    const cached = fnResult.instancePool.get(vt);
                    if (cached) return cached;

                    const instance = merge(vt, initTraits),
                        result = decorateSelf(prop, merged, instance);

                    fnResult.instancePool.set(vt, result);
                    return result
                }
                fnResult.instancePool = new BoxedMultiKeyMap();

                constructorPool.set(dataDecl, prop, receiver, fnResult);
                return fnResult
            }
            const instance = merge(VCons, initTraits),
                result = decorateSelf(prop, merged, instance);

            constructorPool.set(dataDecl, prop, receiver, result);
            return result;
        }
    })

    // Initialize any traits that have been delayed (have an init method)
    // This ties the recursive knot for the family
    initTraits = Object.fromEntries(Object.entries(traits).map(([k, t]) => [k, 'init' in t ? t.init(merged) : t]))

    return merged
}

/**
 * Intercepts the call to the trait method and passes the self object as the first argument
 * @param {*} factory - The factory object
 * @param {*} trait - The trait object
 */
const decorateSelf = (vName, factory, trait) => {
    return new Proxy(trait, {
        get(target, prop, receiver) {
            const maybeTrait = Reflect.get(target, prop, receiver);

            if (isTrait(maybeTrait)) {
                if (!(vName in maybeTrait) && !('_' in maybeTrait))
                    throw new Error(`Trait ${maybeTrait(prop)} does not have a variant ${vName}`)
                // makes 'this' refer to the family and the first argument refer to the data instance (self)
                return (maybeTrait[vName] ?? maybeTrait['_']).bind(factory, receiver)
            } else {
                return maybeTrait
            }
        }
    })
}