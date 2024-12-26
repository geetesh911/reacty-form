import { isFunction } from './is-function';

export const objectHasFunction = <T>(data: T): boolean => {
    for (const key in data) {
        if (isFunction(data[key])) {
            return true;
        }
    }
    return false;
};
