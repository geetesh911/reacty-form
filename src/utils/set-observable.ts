import { isObservable, Observable } from '@legendapp/state';

import type { FieldPath, FieldValues } from '../types';

import { isKey } from './is-key';
import { isObject } from './is-object';
import { stringToPath } from './string-to-path';

export const setObservable = (
    object: Observable,
    path: FieldPath<FieldValues>,
    value?: unknown,
) => {
    let updatedObject = object;
    let index = -1;
    const tempPath = isKey(path) ? [path] : stringToPath(path);
    const length = tempPath.length;
    const lastIndex = length - 1;

    while (++index < length) {
        const key = tempPath[index];
        let newValue = value;

        if (index !== lastIndex) {
            let objValue = updatedObject[key];

            if (isObservable(objValue)) {
                objValue = objValue.get();
            }

            newValue =
                isObject(objValue) || Array.isArray(objValue)
                    ? objValue
                    : !Number.isNaN(+tempPath[index + 1])
                      ? []
                      : {};
        }

        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return;
        }

        if (isObservable(updatedObject[key])) {
            updatedObject[key].set(newValue);
        }

        updatedObject = updatedObject[key] as Observable<FieldValues>;
    }

    return updatedObject;
};
