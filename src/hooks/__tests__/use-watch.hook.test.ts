import { observable } from '@legendapp/state';
import { useObserve } from '@legendapp/state/react';
import { cleanup, renderHook } from '@testing-library/react-hooks';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import type { FieldValues, UseFormReturn } from '../../types';
import { useFormContext } from '../use-form-context.hook';
import { useWatch } from '../use-watch.hook';

// Mock dependencies
vi.mock('@legendapp/state/react', () => ({
    useObserve: vi.fn(),
    useObservable: vi.fn().mockReturnValue({
        errors: observable({}),
        touchedFields: observable({}),
        dirtyFields: observable({}),
    }),
}));
vi.mock('../use-form-context.hook', () => ({
    useFormContext: vi.fn(),
}));

afterEach(() => {
    cleanup();
});

describe('useWatch', () => {
    const mockUseObserve = useObserve as Mock;
    const mockUseFormContext = useFormContext as Mock;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw an error if Form is not provided, either pass the form in props or wrap you form inside FormProvider', () => {
        mockUseFormContext.mockReturnValue(undefined);

        const { result } = renderHook(() => useWatch({ name: 'test' }, vi.fn()));

        expect(result.error).toEqual(
            new Error(
                'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
            ),
        );
    });

    it('should use form from context if not provided in props', () => {
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;
        mockUseFormContext.mockReturnValue(mockForm);

        renderHook(() => useWatch({ name: 'test' }, vi.fn()));

        expect(mockForm.getObservable).toHaveBeenCalledWith('test');
        expect(mockUseObserve).toHaveBeenCalledWith('observable', expect.any(Function));
    });

    it('should use form from props if provided', () => {
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;

        renderHook(() => useWatch({ name: 'test', form: mockForm }, vi.fn()));

        expect(mockForm.getObservable).toHaveBeenCalledWith('test');
        expect(mockUseObserve).toHaveBeenCalledWith('observable', expect.any(Function));
    });

    it('should call the callback when the observable changes', () => {
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;
        const mockCallback = vi.fn();

        renderHook(() => useWatch({ name: 'test', form: mockForm }, mockCallback));

        const observerCallback = mockUseObserve.mock.calls[0][1];
        observerCallback();

        expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle undefined name', () => {
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;

        renderHook(() => useWatch({ form: mockForm }, vi.fn()));

        expect(mockForm.getObservable).toHaveBeenCalledWith(undefined);
    });

    it('should handle array of field names', () => {
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;

        renderHook(() => useWatch({ name: ['field1', 'field2'], form: mockForm }, vi.fn()));

        expect(mockForm.getObservable).toHaveBeenCalledWith(['field1', 'field2']);
    });

    it('should handle readonly array of field names', () => {
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;
        const fieldNames = ['field1', 'field2'] as const;

        renderHook(() => useWatch({ name: fieldNames, form: mockForm }, vi.fn()));

        expect(mockForm.getObservable).toHaveBeenCalledWith(fieldNames);
    });

    it('should pass the correct value to callback', () => {
        const mockValue = { test: 'value' };
        const mockForm = {
            getObservable: vi.fn().mockReturnValue('observable'),
        } as unknown as UseFormReturn<FieldValues>;
        const mockCallback = vi.fn();

        renderHook(() => useWatch({ name: 'test', form: mockForm }, mockCallback));

        const observerCallback = mockUseObserve.mock.calls[0][1];
        observerCallback(mockValue);

        expect(mockCallback).toHaveBeenCalledWith(mockValue);
    });
});
