import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { getEventValue } from '../../logic/get-event-value';
import { useFormContext } from '../../providers';
import { useController } from '../use-controller.hook';
import { useForm } from '../use-form.hook';

import { getMockForm } from './mock-form';

vi.mock('../../providers/form.provider', () => ({
    useFormContext: vi.fn(),
}));
vi.mock('../../logic/get-event-value', () => ({
    getEventValue: vi.fn(),
}));

describe('useController', () => {
    const { mockFormReturn } = getMockForm();

    const setup = () => {
        const { result: formResult } = renderHook(() =>
            useForm({
                defaultValues: {
                    test: '',
                },
            }),
        );

        const { result: controllerResult } = renderHook(() =>
            useController({
                name: 'test',
                form: formResult.current,
            }),
        );

        return { formResult, controllerResult };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return correct initial values', () => {
        const { controllerResult } = setup();

        expect(controllerResult.current.name).toBe('test');
        expect(controllerResult.current.disabled).toBe(false);
    });

    it('should call setValue on onChange', () => {
        const { formResult, controllerResult } = setup();
        const event = { target: { value: 'new value' } };

        (getEventValue as Mock).mockReturnValue('new value');

        act(() => {
            controllerResult.current.onChange(event);
        });

        expect(formResult.current.getValues('test')).toBe('new value');
    });

    it('should call _executeSchemaAndUpdateState on onChange if reValidateMode is onChange', async () => {
        const { formResult, controllerResult } = setup();
        formResult.current.control._formState.isSubmitted = true;
        formResult.current.control._options.reValidateMode = 'onChange';

        const spy = vi.spyOn(formResult.current.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controllerResult.current.onChange({ target: { value: 'new value' } });
        });

        expect(spy).toHaveBeenCalled();
    });

    it('should call _executeSchemaAndUpdateState on onBlur if mode is onBlur', async () => {
        const { formResult, controllerResult } = setup();

        formResult.current.control._options.mode = 'onBlur';

        const spy = vi.spyOn(formResult.current.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controllerResult.current.onBlur();
        });

        expect(spy).toHaveBeenCalled();
    });

    it('should call _executeSchemaAndUpdateState on onBlur if reValidateMode is onBlur and form is submitted', async () => {
        const { formResult, controllerResult } = setup();

        formResult.current.control._formState.isSubmitted = true;
        formResult.current.control._options.reValidateMode = 'onBlur';

        const spy = vi.spyOn(formResult.current.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controllerResult.current.onBlur();
        });

        expect(spy).toHaveBeenCalled();
    });

    it('should set touched field on onBlur', async () => {
        const { formResult, controllerResult } = setup();

        await act(async () => {
            controllerResult.current.onBlur();
        });

        expect(formResult.current.formState$.touchedFields.test.get()).toBe(true);
    });

    it('should format value on onChange if formatValue is provided', () => {
        const formatValue = vi.fn((value) => `formatted-${value}`);
        const { result: formResult } = renderHook(() =>
            useForm({
                defaultValues: {
                    test: '',
                },
            }),
        );

        const { result: controllerResult } = renderHook(() =>
            useController({
                name: 'test',
                form: formResult.current,
                formatValue,
            }),
        );

        const event = { target: { value: 'new value' } };

        (getEventValue as Mock).mockReturnValue('new value');

        act(() => {
            controllerResult.current.onChange(event);
        });

        expect(formatValue).toHaveBeenCalledWith('new value');
        expect(formResult.current.getValues('test')).toBe('formatted-new value');
    });

    it('should disable the field if form is submitting', async () => {
        const { formResult, controllerResult } = setup();
        await formResult.current.handleSubmit(() =>
            expect(controllerResult.current.disabled).toBe(true),
        )();
    });

    it('should not call _executeSchemaAndUpdateState on onChange if reValidateMode is not onChange', async () => {
        const { formResult, controllerResult } = setup();
        formResult.current.control._formState.isSubmitted = true;
        formResult.current.control._options.reValidateMode = 'onBlur';

        const spy = vi.spyOn(formResult.current.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controllerResult.current.onChange({ target: { value: 'new value' } });
        });

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not call _executeSchemaAndUpdateState on onBlur if mode is not onBlur', async () => {
        const { formResult, controllerResult } = setup();
        formResult.current.control._options.mode = 'onChange';

        const spy = vi.spyOn(formResult.current.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controllerResult.current.onBlur();
        });

        expect(spy).not.toHaveBeenCalled();
    });

    it('should throw error when neither form prop nor form context is available', () => {
        (useFormContext as Mock).mockReturnValue(undefined);

        expect(() => renderHook(() => useController({ name: 'test' })).result.current).toThrow(
            'Form is not provided',
        );
    });

    it('should not throw error when form prop is not passed but form context is available', () => {
        (useFormContext as Mock).mockReturnValue(vi.fn());

        expect(
            () => renderHook(() => useController({ name: 'test' })).result.current,
        ).not.toThrow();
    });

    // new test

    it('should validate on blur when mode is onTouched and field is not touched', async () => {
        const form = mockFormReturn;
        form.control._options.mode = 'onTouched';
        const controller = useController({ name: 'mock', form });
        const spy = vi.spyOn(form.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controller.onBlur();
        });
        expect(spy).toHaveBeenCalled();
    });

    it('should not validate on blur when mode is onTouched and field is already touched', async () => {
        const form = mockFormReturn;
        form.control._options.mode = 'onTouched';
        form.formState$.touchedFields.set({ mock: true });

        const controller = useController({ name: 'mock', form });
        const spy = vi.spyOn(form.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controller.onBlur();
        });

        expect(spy).not.toHaveBeenCalled();
    });

    it('should validate on blur when mode is onBlur', async () => {
        const form = mockFormReturn;
        form.control._options.mode = 'onBlur';

        const controller = useController({ name: 'mock', form });
        const spy = vi.spyOn(form.control, '_executeSchemaAndUpdateState');

        await act(async () => {
            controller.onBlur();
        });

        expect(spy).toHaveBeenCalled();
    });

    it('should validate on blur when form is submitted and reValidateMode is onBlur', async () => {
        const mockExecuteSchema = vi.fn();
        const form = mockFormReturn;
        form.control._options.reValidateMode = 'onBlur';
        form.control._formState.isSubmitted = true;
        form.control._executeSchemaAndUpdateState = mockExecuteSchema;

        const controller = useController({ name: 'mock', form });

        await act(async () => {
            controller.onBlur();
        });

        expect(mockExecuteSchema).toHaveBeenCalled();
    });

    // Add these tests after the existing test cases
    it('should return correct value from getValues', () => {
        const form = mockFormReturn;
        form.getValues = vi.fn().mockReturnValue('test value');

        const controller = useController({ name: 'mock', form });

        expect(controller.value).toBe('test value');
        expect(form.getValues).toHaveBeenCalledWith('mock');
    });

    it('should return default value when getValues returns undefined', () => {
        const form = mockFormReturn;
        form.getValues = vi.fn().mockReturnValue(undefined as any);
        form.control._options.defaultValues = { mock: 'default value' };

        const controller = useController({ name: 'mock', form });

        expect(controller.value).toBe('default value');
    });

    it('should return correct disabled state', () => {
        const form = mockFormReturn;
        form.control._formState.disabled = true;

        const controller = useController({ name: 'mock', form });

        expect(controller.disabled).toBe(true);
    });
});
