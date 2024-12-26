import { renderHook } from '@testing-library/react-hooks';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useFormContext } from '../use-form-context.hook';
import { useFormState } from '../use-form-state.hook';

import { getMockForm } from './mock-form';

vi.mock('../use-form-context.hook', () => ({
    useFormContext: vi.fn(),
}));

describe('useFormState', () => {
    const { mockFormReturn, mockFormState } = getMockForm();

    beforeEach(() => {
        (useFormContext as Mock).mockReturnValue(mockFormReturn);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return form state from context when no props are provided', () => {
        const { result } = renderHook(() => useFormState());

        expect(result.current).toEqual(expect.objectContaining(mockFormState));
        expect(useFormContext).toHaveBeenCalled();
    });

    it('should return form state from provided form prop', () => {
        const { result } = renderHook(() => useFormState({ form: mockFormReturn }));

        expect(result.current).toEqual(expect.objectContaining(mockFormState));
        expect(useFormContext).toHaveBeenCalled();
    });

    it('should throw an error if Form is not provided, either pass the form in props or wrap you form inside FormProvider and context is not available', () => {
        (useFormContext as Mock).mockReturnValue(undefined);

        const { result } = renderHook(() => useFormState());

        expect(result.error).toEqual(
            new Error(
                'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
            ),
        );
    });
});
