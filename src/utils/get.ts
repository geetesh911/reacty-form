import { compact } from './compact';
import { isNullOrUndefined } from './is-null-or-undefined';
import { isObject } from './is-object';
import { isUndefined } from './is-undefined';

export const get = <T>(object: T, path?: string | null, defaultValue?: unknown): any => {
    if (!path || !isObject(object)) {
        return defaultValue;
    }

    const result = compact(path.split(/[,[\].]+?/)).reduce(
        (r, key) => (isNullOrUndefined(r) ? r : r[key as keyof object]),
        object,
    );

    return isUndefined(result) || result === object
        ? isUndefined(object[path as keyof T])
            ? defaultValue
            : object[path as keyof T]
        : result;
};
