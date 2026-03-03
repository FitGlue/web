/**
 * Resolves an enum value that may come from the API as either a string name or a numeric value.
 * Gateway protobufs serialize enums as string names (e.g., "CONFIG_FIELD_TYPE_BOOLEAN"),
 * but TypeScript enums expect numeric comparisons.
 *
 * @param value - The raw value from the API (could be string or number)
 * @param enumObj - The TypeScript enum object to resolve against
 * @returns The numeric enum value
 */
export function resolveEnum<T extends Record<string, string | number>>(
    value: string | number | undefined,
    enumObj: T,
): T[keyof T] {
    if (value === undefined || value === null) {
        return 0 as T[keyof T];
    }
    // Already numeric
    if (typeof value === 'number') {
        return value as T[keyof T];
    }
    // String name → look up in reverse mapping
    const resolved = enumObj[value as keyof T];
    if (resolved !== undefined) {
        return resolved as T[keyof T];
    }
    // Fallback: try parsing as number string
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
        return parsed as T[keyof T];
    }
    return 0 as T[keyof T];
}
