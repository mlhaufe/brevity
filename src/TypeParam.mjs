import { id } from "./id.mjs"

export class TypeParam {
    #name
    constructor(name) {
        this.#name = name
    }
    getTransformer(conf) { return conf.getParamXF(this.#name) ?? id }
}