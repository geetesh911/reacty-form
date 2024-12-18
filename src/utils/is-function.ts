export const isFunction = (value: unknown): value is () => void => typeof value === 'function';
