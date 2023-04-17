import { hasPrototype } from "./hasPrototype.mjs";

const protoComplect = Object.create(null);

export const isComplect = obj => hasPrototype(obj, protoComplect);

/**
 *
 * @param {object} dataDecl - The data declaration
 * @param {Record<PropertyKey,object>} traitCfg - The trait configuration
 */
export const complect = (dataDecl, traitCfg) => {
    const merged = new Proxy(Object.create(protoComplect), {
        get(_target, variantName) {
            const result = dataDecl[variantName];

            if (typeof result === 'function')
                return (...args) => forwardingProxy(result(...args), traitCfg, variantName);
            else
                return forwardingProxy(result, traitCfg, variantName);
        }
    });

    return Object.freeze(merged);
}

/**
 * Intercept all property access and forward to the instance if they exist
 * otherwise forward them to the corresponding traitCfg entry
 * and bind the instance as the receiver
 */
function forwardingProxy(instance, traitCfg, variantName) {
    return new Proxy(instance, {
        get(target, propName, receiver) {
            if (propName in target) {
                return target[propName];
            } else if (propName in traitCfg) {
                const trait = traitCfg[propName];
                return trait[variantName].bind(trait, receiver);
                // return trait[variantName].bind(receiver, receiver);
            }
        }
    });
}
