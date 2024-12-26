import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FormProvider } from '../../providers/form.provider';
import { useController } from '../use-controller.hook';
import { useForm } from '../use-form.hook';

describe('useController', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm();
        return <FormProvider form={methods}>{children}</FormProvider>;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw error when Form is not provided, either pass the form in props or wrap you form inside FormProvider', () => {
        expect(() => renderHook(() => useController({ name: 'test' }))).toThrow(
            'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
        );
    });

    it('should return field properties with default value', () => {
        const { result } = renderHook(
            () =>
                useController({
                    name: 'test',
                    defaultValue: 'default',
                }),
            { wrapper: Wrapper },
        );

        expect(result.current.field.name).toBe('test');
        expect(result.current.field.value).toBe('default');
        expect(typeof result.current.field.onChange).toBe('function');
        expect(typeof result.current.field.onBlur).toBe('function');
        expect(result.current.field.ref).toBeDefined();
    });

    it('should handle disabled state', () => {
        const { result } = renderHook(
            () =>
                useController({
                    name: 'test',
                    disabled: true,
                }),
            { wrapper: Wrapper },
        );

        expect(result.current.field.disabled).toBe(true);
    });

    it('should handle form-level disabled state', () => {
        const { result } = renderHook(() => {
            const form = useForm({ disabled: true });
            return useController({
                name: 'test',
                form,
            });
        });

        expect(result.current.field.disabled).toBe(true);
    });

    it('should handle value changes', () => {
        const { result } = renderHook(() => {
            const form = useForm();
            return {
                controller: useController({
                    name: 'test',
                    form,
                }),
                form,
            };
        });

        act(() => {
            result.current.form.setValue('test', 'new value');
        });

        expect(result.current.controller.field.value).toBe('new value');
    });

    it('should handle custom value transformation with setValueAs', () => {
        const setValueAs = (value: string) => value.toUpperCase();
        const { result } = renderHook(
            () =>
                useController({
                    name: 'test',
                    setValueAs,
                }),
            { wrapper: Wrapper },
        );

        act(() => {
            result.current.field.onChange({ target: { value: 'test' } });
        });

        expect(result.current.field.value).toBe('TEST');
    });

    it('should provide field state', () => {
        const { result } = renderHook(
            () =>
                useController({
                    name: 'test',
                }),
            { wrapper: Wrapper },
        );

        act(() => {
            result.current.field.onBlur({ target: {} });
        });

        expect(result.current.fieldState.isTouched).toBe(true);
    });

    it('should provide form state', () => {
        const { result } = renderHook(
            () =>
                useController({
                    name: 'test',
                }),
            { wrapper: Wrapper },
        );

        expect(result.current.formState.isSubmitted).toBe(false);

        act(() => {
            result.current.formState.isSubmitted = true;
        });

        expect(result.current.formState.isSubmitted).toBe(true);
    });

    it('should handle nested field paths', () => {
        const { result } = renderHook(() => {
            const form = useForm({
                defaultValues: {
                    nested: {
                        field: 'nested value',
                    },
                },
            });
            return useController({
                name: 'nested.field',
                form,
            });
        });

        expect(result.current.field.value).toBe('nested value');
    });
});
