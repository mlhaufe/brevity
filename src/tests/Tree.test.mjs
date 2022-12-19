import { Data } from "../Data.mjs"
import { Trait } from "../Trait.mjs"

describe('Tree Tests', () => {
    const Tree = Data({ Leaf: ['value'], Branch: ['left', 'right'] })
    test('Tree data', () => {
        const tree = Tree.Branch({ left: Tree.Leaf({ value: 1 }), right: Tree.Leaf({ value: 2 }) });
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
        const tree = Tree.Branch({ left: Tree.Leaf({ value: 1 }), right: Tree.Leaf({ value: 2 }) });
        expect(print(tree)).toBe('(1, 2)');

        const tree2 = Tree.Branch({ left: Tree.Leaf({ value: 3 }), right: Tree.Branch({ left: Tree.Leaf({ value: 4 }), right: Tree.Leaf({ value: 5 }) }) });
        expect(print(tree2)).toBe('(3, (4, 5))');
    })

})