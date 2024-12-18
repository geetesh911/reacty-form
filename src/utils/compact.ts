export const compact = <TValue>(value: TValue[]): TValue[] =>
    Array.isArray(value) ? value.filter(Boolean) : [];
