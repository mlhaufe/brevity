/**
 * A MultiKey WeakMap that supports primitive keys.
 */
export class BoxedMultiKeyMap {
    #map = new WeakMap();
    #primitiveMap = new Map();
    #null = Object.create(null);
    #undefined = Object.create(null);

    /**
     * Boxes a primitive key if necessary.
     * @param {any} key The value to box
     * @returns {any} The boxed value or the original value if it is already an object
     */
    #objKey(key) {
        if (key === null) return this.#null;
        if (key === undefined) return this.#undefined;
        if (typeof key === 'number')
            return this.#primitiveMap.get(key) ?? this.#primitiveMap.set(key, new Number(key)).get(key);
        if (typeof key === 'string')
            return this.#primitiveMap.get(key) ?? this.#primitiveMap.set(key, new String(key)).get(key);
        if (typeof key === 'boolean')
            return this.#primitiveMap.get(key) ?? this.#primitiveMap.set(key, new Boolean(key)).get(key);
        if (typeof key === 'bigint')
            return this.#primitiveMap.get(key) ?? this.#primitiveMap.set(key, Object(key)).get(key);
        // currently needed due to the following being at Stage 3:
        // https://github.com/tc39/proposal-symbols-as-weakmap-keys
        if (typeof key === 'symbol')
            return this.#primitiveMap.get(key) ?? this.#primitiveMap.set(key, Object(key)).get(key);
        // This may be a mistake in general, but for use in the data module it is necessary
        // for supporting strict equality
        if (typeof key === 'function' && key.toString().startsWith('(')) {
            const strFunc = key.toString();
            return this.#primitiveMap.get(strFunc) ?? this.#primitiveMap.set(strFunc, key).get(strFunc);
        }

        return key;
    }

    /**
     * Checks if the map has a value for the given keys.
     * @param {any[]} keys The keys to check
     * @returns {any} The value for the given keys or undefined if no value exists
     * @throws {TypeError} If the number of keys is less than 1
     * @example
     * const map = new BoxedMultiKeyMap();
     * map.set(1, 2, 3, 4);
     * map.get(1, 2, 3); // 4
     */
    get(...keys) {
        const lastMap = keys.reduce((map, key) => {
            if (map === undefined)
                return undefined;
            const objKey = this.#objKey(key);
            return map.get(objKey);
        }, this.#map);

        if (lastMap === undefined)
            return undefined;

        return lastMap.get(this.#objKey(keys[keys.length - 1]));
    }

    /**
     * Sets the value for the given keys.
     * @param {any[]} keysAndValue The keys and value to set
     * @returns {void}
     * @throws {TypeError} If the number of keys is less than 1
     * @example
     * const map = new BoxedMultiKeyMap();
     * map.set(1, 2, 3, 4);
     * map.get(1, 2, 3); // 4
     */
    set(...keysAndValue) {
        const keys = keysAndValue.slice(0, -1),
            value = keysAndValue[keysAndValue.length - 1];

        const lastMap = keys.reduce((map, key) => {
            const objKey = this.#objKey(key);
            if (!map.has(objKey)) {
                const newMap = new WeakMap();
                map.set(objKey, newMap);
            }
            return map.get(objKey);
        }, this.#map);

        lastMap.set(this.#objKey(keys[keys.length - 1]), value);
    }

    /**
     * Deletes the value for the given keys.
     * @param {any[]} keys The keys to delete
     * @returns {void}
     * @throws {TypeError} If the number of keys is less than 1
     * @example
     * const map = new BoxedMultiKeyMap();
     * map.set(1, 2, 3, 4);
     * map.delete(1, 2, 3);
     * map.get(1, 2, 3); // undefined
     * map.get(1, 2); // undefined
     * map.get(1); // undefined
     */
    delete(...keys) {
        const lastMap = keys.reduce((map, key) => {
            if (map === undefined)
                return undefined;
            const objKey = this.#objKey(key);
            if (!map.has(objKey))
                return undefined;
            return map.get(objKey);
        }, this.#map);

        if (lastMap === undefined)
            return;

        lastMap.delete(this.#objKey(keys[keys.length - 1]));
    }

    /**
     * Checks if the map has a value for the given keys.
     * @param {any[]} keys The keys to check
     * @returns {boolean} Whether the map has a value for the given keys
     * @throws {TypeError} If the number of keys is less than 1
     * @example
     * const map = new BoxedMultiKeyMap();
     * map.set(1, 2, 3, 4);
     * map.has(1, 2, 3); // true
     * map.has(1, 2, 3, 4); // false
     */
    has(...keys) {
        const lastMap = keys.reduce((map, key) => {
            if (map === undefined)
                return undefined;
            const objKey = this.#objKey(key);
            if (!map.has(objKey))
                return undefined;
            return map.get(objKey);
        }, this.#map);

        if (lastMap === undefined)
            return false;

        return lastMap.has(this.#objKey(keys[keys.length - 1]));
    }
}