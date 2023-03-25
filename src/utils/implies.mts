/**
 * Logical implication
 * @param p - The first proposition
 * @param q - The second proposition
 * @returns The result of the implication
 */
export const implies = (p: boolean, q: boolean) => !p || q;