export const isLambda = (f) =>
    typeof f == 'function' && String(f)[0] === '('