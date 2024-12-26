import {
    deepEqual,
    isNullOrUndefined,
    isObject,
    isPrimitive,
    isUndefined,
    objectHasFunction,
} from '../utils';

function markFieldsDirty<T>(data: T, fields: Record<string, any> = {}) {
    const isParentNodeArray = Array.isArray(data);

    if (isObject(data) || isParentNodeArray) {
        for (const key in data) {
            if (
                Array.isArray(data[key]) ||
                (isObject(data[key]) && !objectHasFunction(data[key]))
            ) {
                fields[key] = Array.isArray(data[key]) ? [] : {};
                markFieldsDirty(data[key], fields[key]);
            } else if (!isNullOrUndefined(data[key])) {
                fields[key] = true;
            }
        }
    }

    return fields;
}

function getDirtyFieldsFromDefaultValues<T>(
    data: T,
    formValues: T,
    dirtyFieldsFromValues: Record<
        Extract<keyof T, string>,
        ReturnType<typeof markFieldsDirty> | boolean
    >,
) {
    const isParentNodeArray = Array.isArray(data);

    if (isObject(data) || isParentNodeArray) {
        for (const key in data) {
            if (
                Array.isArray(data[key]) ||
                (isObject(data[key]) && !objectHasFunction(data[key]))
            ) {
                if (isUndefined(formValues) || isPrimitive(dirtyFieldsFromValues[key])) {
                    dirtyFieldsFromValues[key] = Array.isArray(data[key])
                        ? markFieldsDirty(data[key], [])
                        : { ...markFieldsDirty(data[key]) };
                } else {
                    getDirtyFieldsFromDefaultValues(
                        data[key],
                        isNullOrUndefined(formValues) ? {} : formValues[key],
                        dirtyFieldsFromValues[key],
                    );
                }
            } else {
                dirtyFieldsFromValues[key] = !deepEqual(data[key], formValues[key]);
            }
        }
    }

    return dirtyFieldsFromValues;
}

export const getDirtyFields = <T>(defaultValues: T, formValues: T) =>
    getDirtyFieldsFromDefaultValues(defaultValues, formValues, markFieldsDirty(formValues));
