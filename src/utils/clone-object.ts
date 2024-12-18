import { isObject } from './is-object';
import { isPlainObject } from './is-plain-object';
import { isWeb } from './is-web';

export function cloneObject<T>(data: T): T {
    let copy: any;
    const isArray = Array.isArray(data);
    const isFileListInstance = typeof FileList !== 'undefined' ? data instanceof FileList : false;

    if (data instanceof Date) {
        copy = new Date(data);
    } else if (data instanceof Set) {
        copy = new Set(data);
    } else if (
        !(isWeb && (data instanceof Blob || isFileListInstance)) &&
        (isArray || isObject(data))
    ) {
        copy = isArray ? [] : {};

        if (!isArray && !isPlainObject(data)) {
            copy = data;
        } else {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    copy[key] = cloneObject(data[key]);
                }
            }
        }
    } else {
        return data;
    }

    return copy;
}
