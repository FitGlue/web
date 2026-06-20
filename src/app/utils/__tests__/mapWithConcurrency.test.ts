import { describe, it, expect } from 'vitest';
import { mapWithConcurrency } from '../mapWithConcurrency';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('mapWithConcurrency', () => {
    it('preserves input order in the results', async () => {
        const out = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => {
            // Make earlier items resolve later to prove ordering is by index.
            await new Promise<void>(r => setTimeout(r, (6 - n) * 2));
            return n * 10;
        });
        expect(out).toEqual([10, 20, 30, 40, 50]);
    });

    it('never runs more than `limit` tasks at once', async () => {
        let active = 0;
        let peak = 0;
        await mapWithConcurrency(Array.from({ length: 10 }, (_, i) => i), 3, async (n) => {
            active += 1;
            peak = Math.max(peak, active);
            await tick();
            active -= 1;
            return n;
        });
        expect(peak).toBeLessThanOrEqual(3);
        expect(peak).toBeGreaterThan(1);
    });

    it('returns an empty array for no items', async () => {
        const out = await mapWithConcurrency([], 4, async () => 1);
        expect(out).toEqual([]);
    });

    it('passes the index to the mapper', async () => {
        const out = await mapWithConcurrency(['a', 'b', 'c'], 2, async (item, i) => `${item}${i}`);
        expect(out).toEqual(['a0', 'b1', 'c2']);
    });
});
