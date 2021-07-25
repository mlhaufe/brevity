/*!
 * @license
 * Copyright (C) 2020 Michael L Haufe
 * SPDX-License-Identifier: MIT
 * @see <https://spdx.org/licenses/MIT.html>
 */

import Algebra, {Constructor, merge} from '../Algebra';

abstract class ColorAlgebra extends Algebra {
    abstract Red(): this['ofType'];
    abstract Green(): this['ofType'];
    abstract Blue(): this['ofType'];
}

abstract class ColorData { }
class Red extends ColorData { }
class Green extends ColorData { }
class Blue extends ColorData { }

class ColorFactory extends ColorAlgebra {
    declare ofType: ColorData;
    Red(): this['ofType'] { return new Red(); }
    Green(): this['ofType'] { return new Green(); }
    Blue(): this['ofType'] { return new Blue(); }
}

interface ToString { toString(this: ColorData): string }

class ColorString extends ColorAlgebra {
    declare ofType: ToString;
    Red(): this['ofType'] {
        return { toString() { return '#FF0000'; } };
    }
    Green(): this['ofType'] {
        return { toString() { return '#00FF00'; } };
    }
    Blue(): this['ofType'] {
        return { toString() { return '#0000FF'; } };
    }
}

const Color = merge(ColorFactory,ColorString),
    color = new Color();


export default Color;