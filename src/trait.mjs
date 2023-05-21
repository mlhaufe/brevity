import { traitDecls } from "./symbols.mjs"
import { isObjectLiteral } from "./predicates.mjs";
import { BoxedMultiKeyMap } from "./BoxedMultiKeyMap.mjs";
import { Pattern } from "./Pattern.mjs";
import { Complected } from "./complect.mjs";

export const memoFix = Symbol('memoFix'),
    apply = Symbol('apply')

/**
 * @abstract
 */
export class Trait {
    /**
     * Apples the trait to a complected family variant
     * @param {*} family - The complected family
     * @param {*} variant - The variant to apply
     * @param {...any} args - Additional arguments
     * @returns {*}
     */
    static [apply](family, variant, ...args) {
        return new this(family)[apply](variant, ...args)
    }

    __family__

    constructor(family) {
        this.__family__ = family
    }

    [apply](variant, ...args) {
        const vName = variant.constructor.name,
            strategy = this[vName] ?? this['_']
        if (!strategy)
            throw new TypeError(`Trait cannot be applied. No variant for ${vName} found`)
        if (typeof strategy === 'function')
            return strategy.call(this.__family__, variant, ...args)
        if (strategy instanceof Pattern)
            return strategy.match(this.__family__)(variant, ...args)
    }
}

//@typedef { ((this: any, ...args: any[]) => any) | [...any[], (...args: any[]) => any] } Case

/**
 * @typedef {*} Case
 */

/**
 * @typedef {{ [memoFix]?: object } } CaseOptions
 * @property {object} [memoFix] - Memoization options
 * @property {((...args: any[]) => any) | any} memoFix.bottom - The bottom function
 */

/**
 * @typedef {Object.<string, Case> & CaseOptions} Cases
 */

/**
 * @overload
 * Defines a trait
 * @param {string} methodName - The method name
 * @param {Cases} cases
 * @returns {typeof Trait}
 *
 * @overload
 * Defines a trait
 * @param {typeof Trait | typeof Complected} BaseTrait - The base trait to extend
 * @param {string} methodName - The method name
 * @param {Cases} cases
 * @returns {typeof Trait}
 */
export const trait = function (BaseTrait, methodName, cases) {
    if (arguments.length === 2) {
        // @ts-ignore
        cases = methodName
        // @ts-ignore
        methodName = BaseTrait
        BaseTrait = Trait
    }

    if (BaseTrait.prototype instanceof Complected) {
        BaseTrait = BaseTrait.prototype[traitDecls].find(traitDecl => traitDecl.name === methodName);
        if (!BaseTrait)
            throw new TypeError(`Trait '${methodName}' not found in Complected`);
    } else if (BaseTrait instanceof Complected) {
        BaseTrait = BaseTrait[traitDecls].find(traitDecl => traitDecl.name === methodName);
        if (!BaseTrait)
            throw new TypeError(`Trait '${methodName}' not found in Complected`);
    }

    if (typeof methodName !== 'string')
        throw new TypeError('methodName must be a string');
    if (!isObjectLiteral(cases))
        throw new TypeError('Trait declaration must be an object literal');
    if (BaseTrait !== Trait && !(BaseTrait.prototype instanceof Trait))
        throw new TypeError('BaseTrait must be a Trait constructor or a Complected object');
    if (cases[memoFix] && !('bottom' in cases[memoFix]))
        throw new TypeError("Invalid Trait declaration. Missing 'bottom' property in memoFix");

    const visited = new BoxedMultiKeyMap();

    const memoFixHandler = {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver)
            if (prop === apply)
                return value

            if (typeof value === 'function') {
                const { bottom } = cases[memoFix]
                function fn(...args) {
                    if (!visited.has(...args)) {
                        visited.set(...args, typeof bottom === 'function' ? bottom(...args) : bottom);
                        visited.set(...args, value.apply(this, args));
                    }
                    return visited.get(...args);
                }
                Object.defineProperty(fn, 'length', { value: value.length })
                return fn
            }
            return value
        }
    }

    class _Trait extends BaseTrait {
        static {
            for (const [vName, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(cases))) {
                if (typeof descriptor.value !== 'function' && !(descriptor.value instanceof Pattern))
                    throw new TypeError(`Invalid Trait declaration. Expected function or pattern for '${String(vName)}'`);
                Object.defineProperty(this.prototype, vName, descriptor)
            }
        }

        constructor(family) {
            super(family);

            if (cases[memoFix])
                return new Proxy(this, memoFixHandler)
        }
    }
    Object.defineProperty(_Trait, 'name', { value: methodName })

    return /** @type {typeof Trait} */ (_Trait)
}