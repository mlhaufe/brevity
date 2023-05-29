import { BoxedMultiKeyMap } from "../BoxedMultiKeyMap.mjs";

describe("BoxedMultiKeyMap", () => {
    test('Empty keys', () => {
        const map = new BoxedMultiKeyMap();
        expect(() => map.get()).toThrow(TypeError);
        expect(() => map.set()).toThrow(TypeError);
        expect(() => map.delete()).toThrow(TypeError);
        expect(() => map.has()).toThrow(TypeError);
        expect(() => map.set(...[], 1)).toThrow(TypeError);
    })

    test('String keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set('a', 'b', 'c', 'd');
        expect(map.get('a', 'b', 'c')).toBe('d');
        expect(map.get('a', 'b', 'd')).toBe(undefined);
        expect(map.get('a', 'b', 'c', 'd')).toBe(undefined);
        expect(map.get('a', 'b')).toBe(undefined);
        expect(map.get('a')).toBe(undefined);
        expect(map.has('a', 'b', 'c')).toBe(true);

        expect(() => map.delete('a', 'b', 'c', 'd')).toThrow(TypeError);
        expect(() => map.delete('a', 'b')).toThrow(TypeError);
        expect(() => map.delete('a')).toThrow(TypeError);
        expect(map.get('a', 'b', 'c')).toBe('d'); // nothing deleted

        expect(() => map.delete('a', 'b', 'c')).not.toThrow(TypeError);
        expect(map.get('a', 'b', 'c')).toBe(undefined);
    })

    test('Number keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(1, 2, 3, 4);
        expect(map.get(1, 2, 3)).toBe(4);
        expect(map.get(1, 2)).toBe(undefined);
        expect(map.get(1)).toBe(undefined);
        expect(map.has(1, 2, 3)).toBe(true);

        map.set(1, 2, 3, 4, 5);
        expect(map.get(1, 2, 3)).toBe(4);
        expect(map.get(1, 2, 3, 4)).toBe(5);
        expect(map.get(1, 2, 3, 4, 5)).toBe(undefined);
        expect(map.has(1, 2, 3, 4)).toBe(true);
        expect(map.has(1, 2, 3, 4, 5)).toBe(false);
    })

    test('BigInt keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(1n, 2n, 3n, 4n);
        expect(map.get(1n, 2n, 3n)).toBe(4n);
        expect(map.get(1n, 2n)).toBe(undefined);
        expect(map.get(1n)).toBe(undefined);
        expect(map.has(1n, 2n, 3n)).toBe(true);
    })

    test('Lambda keys', () => {
        const map = new BoxedMultiKeyMap();
        const a = () => 'a';
        const b = () => 'b';
        const c = () => 'c';
        const d = () => 'd';
        map.set(a, b, c, d);
        expect(map.get(a, b, c)).toBe(d);
        expect(map.get(a, b)).toBe(undefined);
        expect(map.get(a)).toBe(undefined);
        expect(map.has(a, b, c)).toBe(true);
    })

    test('Boolean keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(true, false, true, false);
        expect(map.get(true, false, true)).toBe(false);
        expect(map.get(true, false)).toBe(undefined);
        expect(map.get(true)).toBe(undefined);
        expect(map.has(true, false, true)).toBe(true);
    })

    test('Symbol keys', () => {
        const map = new BoxedMultiKeyMap();
        const a = Symbol('a');
        const b = Symbol('b');
        const c = Symbol('c');
        const d = Symbol('d');
        map.set(a, b, c, d);
        expect(map.get(a, b, c)).toBe(d);
        expect(map.get(a, b)).toBe(undefined);
        expect(map.get(a)).toBe(undefined);
        expect(map.has(a, b, c)).toBe(true);
    })

    test('Object keys', () => {
        const map = new BoxedMultiKeyMap();
        const a = {};
        const b = {};
        const c = {};
        const d = {};
        map.set(a, b, c, d);
        expect(map.get(a, b, c)).toBe(d);
        expect(map.get(a, b)).toBe(undefined);
        expect(map.get(a)).toBe(undefined);
        expect(map.has(a, b, c)).toBe(true);
    });

    test('Mixed keys', () => {
        const map = new BoxedMultiKeyMap();
        const a = {};
        const b = Symbol('b');
        const c = 'c';
        const d = 4;
        map.set(a, b, c, d);
        expect(map.get(a, b, c)).toBe(d);
        expect(map.get(a, b)).toBe(undefined);
        expect(map.get(a)).toBe(undefined);
        expect(map.has(a, b, c)).toBe(true);
    })

    test('null keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(null, null, null, 1);
        expect(map.get(null, null, null)).toBe(1);
        expect(map.get(null, null)).toBe(undefined);
        expect(map.get(null)).toBe(undefined);
        expect(map.has(null, null, null)).toBe(true);
    })

    test('undefined keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(undefined, undefined, undefined, 1);
        expect(map.get(undefined, undefined, undefined)).toBe(1);
        expect(map.get(undefined, undefined)).toBe(undefined);
        expect(map.get(undefined)).toBe(undefined);
        expect(map.has(undefined, undefined, undefined)).toBe(true);
    })
})