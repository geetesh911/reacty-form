import { Observable, observable } from '@legendapp/state';
import { vi } from 'vitest';

import type { Control, FieldErrors, FormState, UseFormReturn } from '../../types';

type FieldValues = { mock: string };

export const getMockForm = () => {
    const mockFormState: FormState<FieldValues> = {
        isDirty: false,
        isValid: true,
        errors: {} as FieldErrors<FieldValues>,
        touchedFields: {},
        dirtyFields: {},
        isSubmitting: false,
        isSubmitted: false,
        submitCount: 0,
        isLoading: false,
        isSubmitSuccessful: false,
        isValidating: false,
        disabled: false,
        validatingFields: {},
    };
    const observableFormState: Observable<FormState<FieldValues>> = observable({
        defaultValues: {} as FormState<FieldValues>['defaultValues'],
        errors: {} as FormState<FieldValues>['errors'],
        touchedFields: {} as FormState<FieldValues>['touchedFields'],
        dirtyFields: {} as FormState<FieldValues>['dirtyFields'],
        validatingFields: {} as FormState<FieldValues>['validatingFields'],
        isDirty: false as boolean,
        isValid: true as boolean,
        isSubmitting: false as boolean,
        isSubmitted: false as boolean,
        isLoading: false as boolean,
        isSubmitSuccessful: false as boolean,
        isValidating: false as boolean,
        disabled: false as boolean,
        submitCount: 0,
    });

    const mockControl: Control<FieldValues> = {
        _reset: vi.fn(),
        _executeSchemaAndUpdateState: vi.fn(),
        _options: {},
        _resolver: vi.fn(),
        _getDirty: vi.fn(),
        _resetDefaultValues: vi.fn(),
        _formState: mockFormState,
        _updateValid: vi.fn(),
        _updateFormState: vi.fn(),
        _formValues: {},
        _defaultValues: {},
        _setErrors: vi.fn(),
        handleSubmit: vi.fn(),
        getFieldState: vi.fn(),
        setError: vi.fn(),
    };
    const mockValues$ = observable({ mock: 'value' });

    const mockFormReturn: UseFormReturn<FieldValues> = {
        formState$: observableFormState,
        handleSubmit: vi.fn(),
        reset: vi.fn(),
        setValue: vi.fn(),
        getValues: vi.fn(),
        trigger: vi.fn(),
        control: mockControl,
        setError: vi.fn(),
        clearErrors: vi.fn(),
        getObservable: vi.fn(),
        peekValues: vi.fn(),
        getFieldState: vi.fn(),
        resetField: vi.fn(),
        values$: mockValues$,
    };

    return { mockFormReturn, mockFormState, mockControl, observableFormState };
};
