import '@testing-library/jest-dom/vitest';

import React from 'react';
import { cleanup, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useForm } from '../../hooks/use-form.hook';
import { Controller } from '../controller.component';

// Test input component
const TestInput: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}> = ({ value, onChange, onBlur }) => (
    <input data-testid="test-input" value={value} onChange={onChange} onBlur={onBlur} />
);

vi.mock('../../hooks/use-form-context.hook.ts', () => ({
    useFormContext: vi.fn(),
}));

describe('Controller', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders with component prop correctly', () => {
        const form = renderHook(() => useForm({ defaultValues: { test: 'initial value' } })).result
            .current;

        const { getByTestId } = render(
            <Controller name="test" form={form} component={TestInput as React.FC} />,
        );

        const input = getByTestId('test-input');
        expect(input).toHaveValue('initial value');
    });

    it('renders with render prop correctly', () => {
        const form = renderHook(() => useForm({ defaultValues: { test: 'initial value' } })).result
            .current;

        const { getByTestId } = render(
            <Controller
                name="test"
                form={form}
                render={({ value, onChange, onBlur }) => (
                    <input
                        data-testid="test-input"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                )}
            />,
        );

        const input = getByTestId('test-input');
        expect(input).toHaveValue('initial value');
    });

    it('handles onChange events', () => {
        const form = renderHook(() => useForm({ defaultValues: { test: '' } })).result.current;

        const { getByTestId } = render(
            <Controller name="test" form={form} component={TestInput as React.FC} />,
        );

        const input = getByTestId('test-input');
        fireEvent.change(input, { target: { value: 'new value' } });

        expect(form.getValues().test).toBe('new value');
    });

    it('formats value using formatValue prop', () => {
        const form = renderHook(() => useForm({ defaultValues: { test: 123 } })).result.current;

        const formatValue = (value: unknown) => {
            return parseInt(value as string, 10);
        };

        const { getByTestId } = render(
            <Controller
                name="test"
                form={form}
                component={TestInput as React.FC}
                formatValue={formatValue}
            />,
        );

        const input = getByTestId('test-input');

        fireEvent.change(input, { target: { value: '124' } });

        expect(form.getValues('test')).toBe(124);
    });

    it('handles onBlur events', () => {
        const form = renderHook(() => useForm({ defaultValues: { test: '' } })).result.current;

        const { getByTestId } = render(
            <Controller name="test" form={form} component={TestInput as React.FC} />,
        );

        const input = getByTestId('test-input');
        fireEvent.blur(input);

        // Verify the field is touched after blur
        expect(form.getFieldState('test').isTouched).toBe(true);
    });

    it('updates component when form value changes externally', async () => {
        const form = renderHook(() => useForm({ defaultValues: { test: 'initial' } })).result
            .current;

        const { getByTestId } = render(
            <Controller name="test" form={form} component={TestInput as React.FC} />,
        );

        form.setValue('test', 'updated value');
        await waitFor(() => {
            const input = getByTestId('test-input');
            expect(input).toHaveValue('updated value');
        });
    });
});
