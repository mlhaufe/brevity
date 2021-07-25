/*!
 * @license
 * Copyright (C) 2020 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

import data from './';

describe('Color', () => {
    test('Test Color', () => {
        const color = data({ Red: {}, Green: {}, Blue: {} });

        expect(color).toBeDefined();

        expect(color.Blue).toBeInstanceOf(Function);
        expect(color.Green).toBeInstanceOf(Function);
        expect(color.Red).toBeInstanceOf(Function);

        expect(color.Red()).toBeInstanceOf(color.Red);
    });
});

describe('Point', () => {
    test('Test Point', () => {
        const point = data({
            Pt2: {x: 0, y: 0 },
            Pt3: {x: 0, y: 0, z: 0 },
            Pt4: {x: 0, y: 0, z: 0, t: 0 }
       });

       expect(point).toBeDefined();

       expect(point.Pt2).toBeInstanceOf(Function);

       const pt = point.Pt2({x:1, y: 2});
       expect(pt.x).toBe(1);
       expect(pt.y).toBe(2);
    });
});

describe('Peano', () => {
    test('Test Peano', () => {
        const peano = data({
            Z: {},
            S: {pred: {}}
        });

        expect(peano).toBeDefined();

        expect(peano.Z).toBeDefined();
        expect(peano.S).toBeDefined();

        const zero = peano.Z(),
              one = peano.S({pred: zero });

        expect(one.pred).toBe(zero);
    });
});

describe('List', () => {
    test('Test List', () => {
        const list = data({
            Nil: {},
            Cons: { head: undefined, tail: {} }
        }),
        xs = list.Cons({
            head: 1,
            tail: list.Cons({
                head: 2,
                tail: list.Cons({
                    head: 3,
                    tail: list.Nil()
                })
            })
        });
    });
});
