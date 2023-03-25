import { Data, Trait } from "../index.mjs"

describe('Tree Tests', () => {
    const Tree = Data({ Leaf: ['value'], Branch: ['left', 'right'] }),
        { Leaf, Branch } = Tree;

    test('Tree data', () => {
        const tree = Branch(Leaf(1), Leaf(2));
        expect(tree).toBeDefined();
        expect(tree.left).toBeDefined();
        expect(tree.left.value).toBe(1);
        expect(tree.right).toBeDefined();
        expect(tree.right.value).toBe(2);
    })

    const print = Trait(Tree, {
        Leaf({ value }) { return `${value}` },
        Branch({ left, right }) { return `(${print(left)}, ${print(right)})` }
    })

    test('Tree print', () => {
        const tree = Branch(Leaf(1), Leaf(2));
        expect(print(tree)).toBe('(1, 2)');

        const tree2 = Branch(Branch(Leaf(3), Leaf(4)), Leaf(5));
        expect(print(tree2)).toBe('((3, 4), 5)');
    })
})