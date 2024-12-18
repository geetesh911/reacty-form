import type { Primitive } from '../types';

import { isNullOrUndefined } from './is-null-or-undefined';
import { isObjectType } from './is-object';

export const isPrimitive = (value: unknown): value is Primitive =>
    isNullOrUndefined(value) || !isObjectType(value);
