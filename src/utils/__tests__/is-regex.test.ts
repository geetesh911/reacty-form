import { describe, expect, it } from 'vitest';

import { isRegex } from '../is-regex';

describe('isRegex', () => {
    it('should return true when it is a regex', () => {
        expect(isRegex(new RegExp('[a-z]'))).toBeTruthy();
    });
});
