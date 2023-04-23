import { callable } from "./callable.mjs";
import { Data } from "./data.mjs";
import { isObjectLiteral } from "./isObjectLiteral.mjs";

export class Complected {
    *[Symbol.iterator]() {
        for (const key in this) {
            const value = this[key];
            if (typeof value !== 'function')
                yield this[key];
        }
    }
}

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
                        for (let traitName in traits) {
                            // WHat if traits[traitName] is a partial function?
                            const trait = traits[traitName][consName] ?? traits[traitName]['_']
                            if (!trait)
                                throw new Error(`Trait ${traitName} does not have a definition for ${consName}`)
                            this.prototype[traitName] = function (...args) {
                                return trait.call(this, this, ...args)
                            }
                        }

                        Object.defineProperty(this, 'name', { value: consName });
                    }
                    constructor(...args) {
                        super()
                        Object.assign(this, typeof Cons === 'function' ? new Cons(...args) : Cons)
                    }
                })

                this.prototype[consName] = typeof Cons === 'function' ? ComplectedVariant : ComplectedVariant()
            }
        }
    }

    return new ComplectedFactory()
}