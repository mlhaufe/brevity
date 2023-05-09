import { _ } from './symbols.mjs'

const wildcardFn = () => _

const sub1 = (total, arg) => (arg !== _ ? total - 1 : total);

function accumulator(fn, savedArgs, remainingCount) {
    function _partial(...args) {
        const newRemainingCount = args.reduce(sub1, remainingCount),
            newSavedArgs = savedArgs.map((arg) => (arg === _ ? args.shift() : arg));

        return newRemainingCount === 0 ? fn.apply(this, newSavedArgs) :
            accumulator(fn, newSavedArgs, newRemainingCount);
    };

    Object.defineProperty(_partial, 'length', { value: remainingCount });

    return _partial
}

export function partial(fn) {
    return fn.length === 0 ? fn :
        accumulator(fn, Array.from({ length: fn.length }, wildcardFn), fn.length);
}
