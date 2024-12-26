import { describe, expect, it } from 'vitest';

import { isMultipleSelect } from '../is-multiple-select';

describe('isMultipleSelect', () => {
    it('should return true when type is select-multiple', () => {
        expect(isMultipleSelect({ name: 'test', type: 'select-multiple' })).toBeTruthy();
    });
});
