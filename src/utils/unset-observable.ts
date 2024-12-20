import { isObservable, Observable } from '@legendapp/state';

import { isEmptyObject } from './is-empty-object';
import { isKey } from './is-key';
import { isObject } from './is-object';
import { stringToPath } from './string-to-path';
import { baseGet, isEmptyArray } from './unset';

export function unsetObservable(object: Observable, path: string | (string | number)[]) {
    const paths = Array.isArray(path) ? path : isKey(path) ? [path] : stringToPath(path);

    const childObject$ = paths.length === 1 ? object : baseGet(object, paths);
    const childObject = childObject$.peek();

    const index = paths.length - 1;
    const key = paths[index];

    if (childObject && isObservable(childObject$[key])) {
        Array.isArray(childObject) ? childObject$[key].set(undefined) : childObject$[key].delete();
    }

    if (
        index !== 0 &&
        ((isObject(childObject) && isEmptyObject(childObject)) ||
            (Array.isArray(childObject) && isEmptyArray(childObject)))
    ) {
        unsetObservable(object, paths.slice(0, -1));
    }

    return object;
}
