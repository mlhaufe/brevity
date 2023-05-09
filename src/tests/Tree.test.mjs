import { complect, data, trait, _ } from "../index.mjs"

describe('Tree Tests', () => {
    const treeData = data((Tree, T) => ({
        Leaf: { value: T },
        Branch: { left: Tree(T), right: Tree(T) }
    }));

    const printable = trait(treeData(_), {
        Leaf({ value }) { return `${value}` },
        Branch({ left, right }) { return `(${left.print()}, ${right.print()})` }
    });

    const NumTree = complect(treeData(Number), { print: printable }),
        { Leaf, Branch } = NumTree;

    test('Tree data', () => {
        const t = Branch(Leaf(1), Leaf(2));
        expect(t).toBeDefined();
        expect(t.left).toBeDefined();
        expect(t.left.value).toBe(1);
        expect(t.right).toBeDefined();
        expect(t.right.value).toBe(2);
    })

    test('Tree print', () => {
        const t1 = Branch(Leaf(1), Leaf(2));
        expect(t1.print()).toBe('(1, 2)');

        const t2 = Branch(Branch(Leaf(3), Leaf(4)), Leaf(5));
        expect(t2.print()).toBe('((3, 4), 5)');
    })
})