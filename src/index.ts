/*!
 * @license
 * Copyright (C) 2020 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

import data from './data';

export default data;

/*
const Counter = list.unfold(function(n: number){
    return n == 0 ? this.Nil() : this.Cons(n, n - 1)
})

// Counter(5).toString()
// Cons(5, Cons(4, Cons(3, Cons(2, Cons(1, Nil)))))

const product = list.fold({
    Nil(){ return 1 },
    Cons(head: number, tail: number){ return head * tail }
})


// product(Counter(5))
// 120

const factorial = Counter.merge(product)
const factorial = Counter.merge(product)

// factorial(5)
// 120
*/