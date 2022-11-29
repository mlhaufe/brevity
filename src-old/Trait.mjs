export function Trait(methods) {
    // TODO: extra methods illegal

    return Object.freeze({ ...methods })
}