import { describe, expect, it } from 'vitest';

import { noop } from '../../utils/noop';
import { objectHasFunction } from '../../utils/object-has-function';

describe('objectHasFunction', () => {
    it('should detect if any object has function', () => {
        expect(objectHasFunction({})).toBeFalsy();
        expect(
            objectHasFunction({
                test: '',
            }),
        ).toBeFalsy();

        expect(
            objectHasFunction({
                test: noop,
            }),
        ).toBeTruthy();
    });
});
