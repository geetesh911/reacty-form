import { describe, expect, it } from 'vitest';

import { isRadioInput } from '../is-radio-input';

describe('isRadioInput', () => {
    it('should return true when type is radio', () => {
        expect(isRadioInput({ name: 'test', type: 'radio' })).toBeTruthy();
    });
});
