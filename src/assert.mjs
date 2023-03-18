export const assert = (condition, message) => {
    if (Boolean(condition) === false) {
        throw new Error(message);
    }
}