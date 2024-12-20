import { isEmptyObject } from './is-empty-object';
import { isKey } from './is-key';
import { isObject } from './is-object';
import { isUndefined } from './is-undefined';
import { stringToPath } from './string-to-path';

export function baseGet(object: any, updatePath: (string | number)[]) {
    const length = updatePath.slice(0, -1).length;
    let index = 0;

    while (index < length) {
        object = isUndefined(object) ? index++ : object[updatePath[index++]];
    }

    return object;
}

export function isEmptyArray(obj: unknown[]) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && !isUndefined(obj[key])) {
            return false;
        }
    }
    return true;
}

export function unset(object: any, path: string | (string | number)[]) {
    const paths = Array.isArray(path) ? path : isKey(path) ? [path] : stringToPath(path);

    const childObject = paths.length === 1 ? object : baseGet(object, paths);

    const index = paths.length - 1;
    const key = paths[index];

    if (childObject) {
        delete childObject[key];
    }

    if (
        index !== 0 &&
        ((isObject(childObject) && isEmptyObject(childObject)) ||
            (Array.isArray(childObject) && isEmptyArray(childObject)))
    ) {
        unset(object, paths.slice(0, -1));
    }

    return object;
}
