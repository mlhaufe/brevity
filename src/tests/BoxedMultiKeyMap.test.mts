import { BoxedMultiKeyMap } from "../BoxedMultiKeyMap.mjs";

describe("BoxedMultiKeyMap", () => {
    test('String keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set('a', 'b', 'c', 'd');
        expect(map.get('a', 'b', 'c')).toBe('d');
        expect(map.get('a', 'b')).toBe(undefined);
        expect(map.get('a')).toBe(undefined);
        expect(map.get()).toBe(undefined);

        expect(map.has('a', 'b', 'c')).toBe(true);
    })

    test('Number keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(1, 2, 3, 4);
        expect(map.get(1, 2, 3)).toBe(4);
        expect(map.get(1, 2)).toBe(undefined);
        expect(map.get(1)).toBe(undefined);
        expect(map.get()).toBe(undefined);

        expect(map.has(1, 2, 3)).toBe(true);
    })

    test('Boolean keys', () => {
        const map = new BoxedMultiKeyMap();
        map.set(true, false, true, false);
        expect(map.get(true, false, true)).toBe(false);
        expect(map.get(true, false)).toBe(undefined);
        expect(map.get(true)).toBe(undefined);
        expect(map.get()).toBe(undefined);

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
        expect(map.get()).toBe(undefined);

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
        expect(map.get()).toBe(undefined);

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
        expect(map.get()).toBe(undefined);

        expect(map.has(a, b, c)).toBe(true);
    })
})