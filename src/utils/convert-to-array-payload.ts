export const convertToArrayPayload = <T>(value: T | Array<T>): Array<T> =>
    Array.isArray(value) ? value : [value];
