import { Field, NativeFieldValue } from '../types';
import { isString, isUndefined } from '../utils';

export const getFieldValueAs = <T extends NativeFieldValue>(
    value: T,
    { valueAsNumber, valueAsDate, setValueAs }: Field['_f'],
) =>
    isUndefined(value)
        ? value
        : valueAsNumber
          ? value === ''
              ? NaN
              : value
                ? +value
                : value
          : valueAsDate && isString(value)
            ? new Date(value)
            : setValueAs
              ? setValueAs(value)
              : value;
