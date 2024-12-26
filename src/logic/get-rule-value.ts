import { ValidationRule, ValidationValue, ValidationValueMessage } from '../types';
import { isObject } from '../utils/is-object';
import { isRegex } from '../utils/is-regex';
import { isUndefined } from '../utils/is-undefined';

export const getRuleValue = <T extends ValidationValue>(
    rule?: ValidationRule<T> | ValidationValueMessage<T>,
) =>
    isUndefined(rule)
        ? rule
        : isRegex(rule)
          ? rule.source
          : isObject(rule)
            ? isRegex(rule.value)
                ? rule.value.source
                : rule.value
            : rule;
