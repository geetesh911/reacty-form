import type { EmptyObject } from '../types';

import { isObject } from './is-object';

export const isEmptyObject = (value: unknown): value is EmptyObject =>
    isObject(value) && !Object.keys(value).length;
