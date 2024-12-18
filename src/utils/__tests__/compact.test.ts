import { describe, expect, it } from 'vitest';

import { compact } from '../compact';

describe('filterOutFalsy', () => {
    it('should return filtered array when array value is falsy ', () => {
        expect(compact([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
        expect(compact([1, 2, false, 4])).toEqual([1, 2, 4]);
        expect(compact([1, 2, '', 4])).toEqual([1, 2, 4]);
        expect(compact([1, 2, undefined, 4])).toEqual([1, 2, 4]);
        expect(compact([0, 1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
        expect(compact(0 as unknown as Array<number>)).toEqual([]);
    });
});
