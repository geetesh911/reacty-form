import { describe, expect, it } from 'vitest';

import * as Hooks from '../index';

describe('hooks index', () => {
    it('should re-export useController', () => {
        expect(Hooks.useController).toBeDefined();
    });

    it('should re-export useFieldArray', () => {
        expect(Hooks.useFieldArray).toBeDefined();
    });

    it('should re-export useForm', () => {
        expect(Hooks.useForm).toBeDefined();
    });

    it('should re-export useFormContext', () => {
        expect(Hooks.useFormContext).toBeDefined();
    });

    it('should re-export useFormState', () => {
        expect(Hooks.useFormState).toBeDefined();
    });

    it('should re-export useWatch', () => {
        expect(Hooks.useWatch).toBeDefined();
    });
});
