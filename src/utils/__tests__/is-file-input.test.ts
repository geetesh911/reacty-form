import { describe, expect, it } from 'vitest';

import { isFileInput } from '../is-file-input';

describe('isFileInput', () => {
    it('should return true when type is file', () => {
        expect(isFileInput({ name: 'test', type: 'file' })).toBeTruthy();
    });
});
