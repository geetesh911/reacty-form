import { isDateObject } from './is-date-object';
import { isNullOrUndefined } from './is-null-or-undefined';

export const isObjectType = (value: unknown): value is object => typeof value === 'object';

export const isObject = <T extends object>(value: unknown): value is T =>
    !isNullOrUndefined(value) &&
    !Array.isArray(value) &&
    isObjectType(value) &&
    !isDateObject(value);
