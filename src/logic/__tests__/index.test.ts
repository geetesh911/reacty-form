import { describe, expect, it } from 'vitest';

import * as Functions from '../index';

describe('hooks index', () => {
    it('should re-export getFieldValueAs', () => {
        expect(Functions.getEventValue).toBeDefined();
    });

    it('should re-export getCheckboxValue', () => {
        expect(Functions.getCheckboxValue).toBeDefined();
    });

    it('should re-export getFieldValue', () => {
        expect(Functions.getFieldValue).toBeDefined();
    });

    it('should re-export getFieldValueAs', () => {
        expect(Functions.getFieldValueAs).toBeDefined();
    });

    it('should re-export getRadioValue', () => {
        expect(Functions.getRadioValue).toBeDefined();
    });

    it('should re-export getDirtyFields', () => {
        expect(Functions.getDirtyFields).toBeDefined();
    });
});
