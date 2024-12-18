import { isObject } from './is-object';

export const isPlainObject = (tempObject: object): boolean => {
    const prototypeCopy = tempObject.constructor?.prototype;

    return (
        isObject(prototypeCopy) &&
        Object.prototype.hasOwnProperty.call(prototypeCopy, 'isPrototypeOf')
    );
};
