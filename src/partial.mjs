import { _ } from './symbols.mjs'

const wildcardFn = () => _

function accumulator(fn, savedArgs, remainingCount) {
    function _partial(...args) {
        const newRemainingCount = args.reduce(
            (sum, arg) => arg !== _ ? sum - 1 : sum,
            remainingCount
        );

        const argClone = [...args];
        const newSavedArgs = savedArgs.map(
            arg => arg === _ ? argClone.shift() : arg
        );

        return newRemainingCount === 0 ? fn(...newSavedArgs) :
            accumulator(fn, newSavedArgs, newRemainingCount);
    };

    Object.defineProperty(_partial, 'length', { value: remainingCount });

    return _partial
}

export function partial(fn) {
    return fn.length === 0 ? fn :
        accumulator(fn, Array.from({ length: fn.length }, wildcardFn), fn.length);
}
