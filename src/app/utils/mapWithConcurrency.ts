/**
 * Map over `items` running at most `limit` async tasks at once, preserving the
 * input order in the results. Lets work pipeline (e.g. uploading one photo while
 * the next is still being resized) instead of running strictly one at a time.
 *
 * `fn` is responsible for its own error handling — a rejection from `fn` will
 * reject the whole call, so wrap per-item failures inside `fn` if you want the
 * rest to continue.
 */
export async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let cursor = 0;

    const worker = async (): Promise<void> => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await fn(items[index], index);
        }
    };

    const poolSize = Math.max(1, Math.min(limit, items.length));
    await Promise.all(Array.from({ length: poolSize }, () => worker()));
    return results;
}
