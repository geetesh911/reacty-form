import { describe, expect, it } from 'vitest';

import { getFieldValueAs } from '../../logic/get-field-value-as';

describe('getFieldValueAs', () => {
    it('should return undefined when value is undefined', () => {
        expect(
            getFieldValueAs(undefined, {
                ref: {
                    name: 'test',
                },
                name: 'test',
                valueAsNumber: true,
                valueAsDate: false,
            }),
        ).toBeUndefined();
    });

    it('should return NaN when valueAsNumber is true and value is empty string', () => {
        expect(
            getFieldValueAs('', {
                ref: { name: 'test' },
                name: 'test',
                valueAsNumber: true,
                valueAsDate: false,
            }),
        ).toBeNaN();
    });

    it('should return number when valueAsNumber is true and value exists', () => {
        expect(
            getFieldValueAs('123', {
                ref: { name: 'test' },
                name: 'test',
                valueAsNumber: true,
                valueAsDate: false,
            }),
        ).toBe(123);
    });

    it('should return value as is when valueAsNumber is true but value is falsy', () => {
        expect(
            getFieldValueAs(0, {
                ref: { name: 'test' },
                name: 'test',
                valueAsNumber: true,
                valueAsDate: false,
            }),
        ).toBe(0);
    });

    it('should return date object when valueAsDate is true', () => {
        const dateString = '2023-01-01';
        expect(
            getFieldValueAs(dateString, {
                ref: { name: 'test' },
                name: 'test',
                valueAsNumber: false,
                valueAsDate: true,
            }),
        ).toEqual(new Date(dateString));
    });

    it('should use setValueAs when provided', () => {
        const setValueAs = (value: any) => `transformed_${value}`;
        expect(
            getFieldValueAs('test', {
                ref: { name: 'test' },
                name: 'test',
                valueAsNumber: false,
                valueAsDate: false,
                setValueAs,
            }),
        ).toBe('transformed_test');
    });
});
