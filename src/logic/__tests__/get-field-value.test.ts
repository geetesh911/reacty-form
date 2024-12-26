import { describe, expect, it, vi } from 'vitest';

import { Field } from '../../types';
import { getFieldValue } from '../get-field-value';

vi.mock('../get-radio-value', () => ({
    getRadioValue: vi.fn().mockReturnValue({
        value: 2,
    }),
}));

vi.mock('../get-checkbox-value', () => ({
    getCheckboxValue: vi.fn().mockReturnValue({
        value: 'testValue',
    }),
}));

describe('getFieldValue', () => {
    it('should return correct value when type is radio', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    type: 'radio',
                    name: 'test',
                },
            }),
        ).toBe(2);
    });

    it('should return correct value when type is multiple select', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    type: 'select-multiple',
                    name: 'test',
                    selectedOptions: [{ value: 2 }],
                } as any,
            }),
        ).toEqual([2]);
    });

    it('should return the correct value when type is checkbox', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    name: 'test',
                    type: 'checkbox',
                },
            }),
        ).toBe('testValue');
    });

    it('should return it value for other types', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    type: 'text',
                    name: 'bill',
                    value: 'value',
                },
            }),
        ).toBe('value');
    });

    it('should return empty string when radio input value is not found', () => {
        expect(getFieldValue({ ref: {} } as Field['_f'])).toEqual(undefined);
    });

    it('should return files for input type file', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    type: 'file',
                    name: 'test',
                    files: null,
                },
            }),
        ).toEqual(null);
    });

    it('should return undefined when input is not found', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    name: 'file',
                    files: null,
                },
            }),
        ).toEqual(undefined);
    });

    it('should not return value when the input is disabled', () => {
        expect(
            getFieldValue({
                name: 'test',
                ref: {
                    name: 'radio',
                    disabled: true,
                    type: 'radio',
                },
            }),
        ).toEqual(undefined);
    });
});
