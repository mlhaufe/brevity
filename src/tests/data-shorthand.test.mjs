import { Data, Trait, variant, variantName } from "../index.mjs"

describe('Data shorthand tests', () => {
    const Disk = Data(['position', 'velocity', 'radius', 'item'])

    test('Disk Data', () => {
        expect(Disk).toBeDefined();

        const disk = Disk({ position: [0, 0], velocity: [0, 0], radius: 1, item: 'apple' });
        expect(disk).toBeDefined();
        expect(disk[variant]).toBe(Disk);
        expect(disk[variantName]).toBe('Anonymous!');
        expect(disk.position).toEqual([0, 0]);
        expect(disk.velocity).toEqual([0, 0]);
        expect(disk.radius).toBe(1);
        expect(disk.item).toBe('apple');
    })

    test('print Disk', () => {
        const toString = Trait(Disk, {
            Disk: (self) => {
                const p = JSON.stringify(self.position),
                    v = JSON.stringify(self.velocity),
                    r = self.radius,
                    i = JSON.stringify(self.item);
                return `Disk(${p}, ${v}, ${r}, ${i})`
            }
        })

        const disk = Disk({ position: [0, 0], velocity: [0, 0], radius: 1, item: 'apple' });

        expect(toString(disk)).toBe('Disk([0,0], [0,0], 1, "apple")');
    })

    test('Array destructuring', () => {
        const disk = Disk({ position: [0, 0], velocity: [1, 3], radius: 1, item: 'apple' });

        const [p, v, r, i] = disk;

        expect(p).toEqual([0, 0]);
        expect(v).toEqual([1, 3]);
        expect(r).toBe(1);
        expect(i).toBe('apple');

        const { position, velocity, radius, item } = disk;

        expect(position).toEqual([0, 0]);
        expect(velocity).toEqual([1, 3]);
        expect(radius).toBe(1);
        expect(item).toBe('apple');
    })
})