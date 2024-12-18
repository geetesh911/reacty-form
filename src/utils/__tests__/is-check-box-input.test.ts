import { describe, expect, it } from 'vitest';

import { isCheckBoxInput } from './../is-check-box-input';

describe('isCheckBoxInput', () => {
    it('should return true when type is checkbox', () => {
        expect(isCheckBoxInput({ name: 'test', type: 'checkbox' })).toBeTruthy();
    });
});
