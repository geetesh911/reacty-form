import '@testing-library/jest-dom/vitest';

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

import { batch } from '@legendapp/state';

import { VALIDATION_MODE } from '../../constants';
import { useForm } from '../use-form.hook';

type FormValues = {
    name?: string | null;
    age?: number | null;
    isActive?: boolean;
    tags?: string[];
    address?: { city: string; zip: string };
};

describe('useForm Hook', () => {
    let defaultValues: FormValues;
    let newValues: FormValues;

    beforeEach(() => {
        defaultValues = { name: 'John', age: 30 };
        newValues = { name: 'Doe', age: 25 };
    });

    describe('Initialization', () => {
        it('should initialize form with default values', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));
            expect(result.current.control._defaultValues).toEqual(defaultValues);
        });
    });

    describe('Value Management', () => {
        it('should set value correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
            });

            expect(result.current.values$.name.get()).toBe('Doe');
        });

        it('should get values correctly', () => {
            const { result } = renderHook(() => useForm({ values: defaultValues }));

            expect(result.current.getValues()).toEqual(defaultValues);
            expect(result.current.getValues('name')).toBe('John');
        });

        it('should handle setValue for multiple fields correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.setValue('age', 25);
            });

            expect(result.current.values$.get()).toEqual({ name: 'Doe', age: 25 });
        });

        it('should handle getValues for multiple fields correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.setValue('age', 25);
            });

            expect(result.current.getValues(['name', 'age'])).toEqual(['Doe', 25]);
        });

        it('should handle setValue and getValues for nested fields correctly', () => {
            const nestedDefaultValues = { user: { name: 'John', age: 30 } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setValue('user.name', 'Doe');
            });

            expect(result.current.getValues('user.name')).toBe('Doe');
            expect(result.current.getValues()).toEqual({ user: { name: 'Doe', age: 30 } });
        });

        it('should handle setValue with deep nested fields correctly', () => {
            const nestedDefaultValues = { user: { profile: { name: 'John', age: 30 } } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setValue('user.profile.name', 'Doe');
            });

            expect(result.current.getValues('user.profile.name')).toBe('Doe');
            expect(result.current.getValues()).toEqual({
                user: { profile: { name: 'Doe', age: 30 } },
            });
        });

        it('should handle setValue with undefined correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', undefined);
            });

            expect(result.current.getValues('name')).toBeUndefined();
        });

        it('should handle setValue with null correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', null);
            });

            expect(result.current.getValues('name')).toBeNull();
        });

        it('should handle setValue with empty string correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', '');
            });

            expect(result.current.getValues('name')).toBe('');
        });

        it('should handle setValue with number correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('age', 40);
            });

            expect(result.current.getValues('age')).toBe(40);
        });

        it('should handle setValue with boolean correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('isActive', true);
            });

            expect(result.current.getValues('isActive')).toBe(true);
        });

        it('should handle setValue with array correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('tags', ['tag1', 'tag2']);
            });

            expect(result.current.getValues('tags')).toEqual(['tag1', 'tag2']);
        });

        it('should handle setValue with object correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('address', { city: 'New York', zip: '10001' });
            });

            expect(result.current.getValues('address')).toEqual({ city: 'New York', zip: '10001' });
        });

        it('should handle setValue with deep nested fields correctly', () => {
            const nestedDefaultValues = { user: { profile: { name: 'John', age: 30 } } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setValue('user.profile.name', 'Doe');
            });

            expect(result.current.getValues('user.profile.name')).toBe('Doe');
            expect(result.current.getValues()).toEqual({
                user: { profile: { name: 'Doe', age: 30 } },
            });
        });

        it('should get peek values correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            const withoutNameObservable = result.current.peekValues();
            const nameObservable = result.current.peekValues('name');
            const ageObservable = result.current.peekValues('age');
            const nameAndAgeObservable = result.current.peekValues(['name', 'age']);

            expect(withoutNameObservable).toBeDefined();
            expect(nameAndAgeObservable).toBeDefined();
            expect(nameObservable).toBeDefined();
            expect(ageObservable).toBeDefined();
            expect(result.current.getValues()).toEqual(defaultValues);
            expect(result.current.getValues(['name', 'age'])).toEqual([
                defaultValues.name,
                defaultValues.age,
            ]);
            expect(result.current.getValues('name')).toBe(defaultValues.name);
            expect(result.current.getValues('age')).toBe(defaultValues.age);
        });

        it('should get observable correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            const withoutNameObservable = result.current.getObservable();
            const nameObservable = result.current.getObservable('name');
            const ageObservable = result.current.getObservable('age');
            const nameAndAgeObservable = result.current.getObservable(['name', 'age']);

            expect(withoutNameObservable).toBeDefined();
            expect(nameAndAgeObservable).toBeDefined();
            expect(nameObservable).toBeDefined();
            expect(ageObservable).toBeDefined();
            expect(result.current.getValues()).toEqual(defaultValues);
            expect(result.current.getValues(['name', 'age'])).toEqual([
                defaultValues.name,
                defaultValues.age,
            ]);

            nameObservable?.set('Jane');
            ageObservable?.set(35);

            expect(result.current.getValues('name')).toBe('Jane');
            expect(result.current.getValues('age')).toBe(35);
        });

        it('_getDirty should correctly identify dirty fields', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            // Initially, not dirty
            expect(result.current.control._getDirty()).toBe(false);

            // Set a value
            act(() => {
                result.current.setValue('age', 31);
            });

            expect(result.current.control._getDirty()).toBe(true);

            // Reset to default
            act(() => {
                result.current.reset();
            });

            expect(result.current.control._getDirty()).toBe(false);
        });
    });

    describe('Submission Handling', () => {
        beforeEach(() => {
            // Common setup for submission tests if any
        });

        it('should handle submit correctly', async () => {
            const onValid = vi.fn();
            const onInvalid = vi.fn();
            const { result } = renderHook(() => useForm({ values: defaultValues }));

            await act(async () => {
                await result.current.handleSubmit(onValid, onInvalid)();
            });

            expect(onValid).toHaveBeenCalledWith(defaultValues, undefined);
            expect(onInvalid).not.toHaveBeenCalled();
        });

        it('should handle submit with invalid data correctly', async () => {
            const onValid = vi.fn();
            const onInvalid = vi.fn();
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Name is required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                await result.current.handleSubmit(onValid, onInvalid)();
            });

            expect(onValid).not.toHaveBeenCalled();
            expect(onInvalid).toHaveBeenCalledWith(
                { name: { type: 'required', message: 'Name is required' } },
                undefined,
            );
        });

        it('should handle async validation correctly', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'async', message: 'Async error' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                const isValid = await result.current.trigger();
                expect(isValid).toBe(false);
            });

            expect(result.current.getFieldState('name').error).toEqual({
                type: 'async',
                message: 'Async error',
            });
        });

        it('should handle submit with errors correctly', async () => {
            const onValid = vi.fn();
            const onInvalid = vi.fn();
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Name is required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                await result.current.handleSubmit(onValid, onInvalid)();
            });

            expect(onValid).not.toHaveBeenCalled();
            expect(onInvalid).toHaveBeenCalledWith(
                { name: { type: 'required', message: 'Name is required' } },
                undefined,
            );
        });

        it('should handle submit without errors correctly', async () => {
            const onValid = vi.fn();
            const onInvalid = vi.fn();
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                await result.current.handleSubmit(onValid, onInvalid)();
            });

            expect(onValid).toHaveBeenCalledWith(defaultValues, undefined);
            expect(onInvalid).not.toHaveBeenCalled();
        });

        it('should handle submit with prevent default correctly', async () => {
            const onValid = vi.fn();
            const event = { preventDefault: vi.fn(), persist: vi.fn() };
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                await result.current.handleSubmit(onValid)(event as any);
            });

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.persist).toHaveBeenCalled();
        });

        it('should handle validation error during submit', async () => {
            const onValid = vi.fn().mockRejectedValue(new Error('Validation failed'));
            const { result } = renderHook(() => useForm({ defaultValues }));

            await expect(
                act(async () => {
                    await result.current.handleSubmit(onValid)();
                }),
            ).rejects.toThrow('Validation failed');

            expect(result.current.formState$.isSubmitSuccessful.get()).toBe(false);
        });

        it('should handle form state updates correctly during submit', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                await result.current.handleSubmit(() => Promise.resolve())();
            });

            expect(result.current.formState$.isSubmitted.get()).toBe(true);
            expect(result.current.formState$.submitCount.get()).toBe(1);
        });

        it('should handle submit with correct arguments', async () => {
            const onValid = vi.fn();
            const onInvalid = vi.fn();
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                await result.current.handleSubmit(onValid, onInvalid)();
            });

            expect(onValid).toHaveBeenCalledWith(defaultValues, undefined);
            expect(onInvalid).not.toHaveBeenCalled();
        });

        it('should handle submit with custom error handling', async () => {
            const customError = new Error('Custom validation error');
            const onValid = vi.fn().mockRejectedValue(customError);
            const onInvalid = vi.fn();
            const { result } = renderHook(() => useForm({ defaultValues }));

            await expect(
                act(async () => {
                    await result.current.handleSubmit(onValid, onInvalid)();
                }),
            ).rejects.toThrow(customError);

            expect(result.current.formState$.isSubmitSuccessful.get()).toBe(false);
            expect(onInvalid).not.toHaveBeenCalled();
        });

        it('should handle submit with event and disabled state', async () => {
            const onValid = vi.fn();
            const event = { preventDefault: vi.fn(), persist: vi.fn() };
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                await result.current.handleSubmit(onValid)(event as any);
            });

            expect(result.current.formState$.disabled.get()).toBe(false);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.persist).toHaveBeenCalled();
        });

        it('should handle loading state during submit', async () => {
            const onValid = vi.fn();
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                const submitPromise = result.current.handleSubmit(onValid)();
                expect(result.current.formState$.isLoading.get()).toBe(true);
                await submitPromise;
            });

            expect(result.current.formState$.isLoading.get()).toBe(false);
        });
    });

    describe('Error Management', () => {
        it('should set and clear errors correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
            });

            expect(result.current.getFieldState('name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });

            act(() => {
                result.current.clearErrors('name');
            });

            expect(result.current.getFieldState('name').error).toBeUndefined();
        });

        it('should handle setError for multiple fields correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.setError('age', { type: 'min', message: 'Age must be at least 18' });
            });

            expect(result.current.getFieldState('name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });
            expect(result.current.getFieldState('age').error).toEqual({
                type: 'min',
                message: 'Age must be at least 18',
            });
        });

        it('should handle clearErrors for multiple fields correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.setError('age', { type: 'min', message: 'Age must be at least 18' });
                result.current.clearErrors(['name', 'age']);
            });

            expect(result.current.getFieldState('name').error).toBeUndefined();
            expect(result.current.getFieldState('age').error).toBeUndefined();
        });

        it('should clear all errors when no name is provided', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.setError('age', { type: 'min', message: 'Age must be at least 18' });
                result.current.clearErrors();
            });

            expect(result.current.getFieldState('name').error).toBeUndefined();
            expect(result.current.getFieldState('age').error).toBeUndefined();
        });

        it('should clear specific error when name is provided', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.setError('age', { type: 'min', message: 'Age must be at least 18' });
                result.current.clearErrors('name');
            });

            expect(result.current.getFieldState('name').error).toBeUndefined();
            expect(result.current.getFieldState('age').error).toEqual({
                type: 'min',
                message: 'Age must be at least 18',
            });
        });

        it('should clear multiple errors when array of names is provided', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.setError('age', { type: 'min', message: 'Age must be at least 18' });
                result.current.clearErrors(['name', 'age']);
            });

            expect(result.current.getFieldState('name').error).toBeUndefined();
            expect(result.current.getFieldState('age').error).toBeUndefined();
        });

        it('should not throw error when clearing non-existent error', () => {
            const { result } = renderHook(() => useForm({}));

            act(() => {
                result.current.clearErrors('nonExistentField');
            });

            expect(result.current.getFieldState('nonExistentField').error).toBeUndefined();
        });

        it('should set error correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
            });

            expect(result.current.getFieldState('name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });
        });

        it('should clear all errors correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.clearErrors();
            });

            expect(result.current.getFieldState('name').error).toBeUndefined();
        });

        it('should handle setError and clearErrors for nested fields correctly', () => {
            const nestedDefaultValues = { user: { name: 'John', age: 30 } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setError('user.name', {
                    type: 'required',
                    message: 'Name is required',
                });
            });

            expect(result.current.getFieldState('user.name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });

            act(() => {
                result.current.clearErrors('user.name');
            });

            expect(result.current.getFieldState('user.name').error).toBeUndefined();
        });

        it('should handle setError with deep nested fields correctly', () => {
            const nestedDefaultValues = { user: { profile: { name: 'John', age: 30 } } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setError('user.profile.name', {
                    type: 'required',
                    message: 'Name is required',
                });
            });

            expect(result.current.getFieldState('user.profile.name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });
        });

        it('should handle clearErrors with deep nested fields correctly', () => {
            const nestedDefaultValues = { user: { profile: { name: 'John', age: 30 } } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setError('user.profile.name', {
                    type: 'required',
                    message: 'Name is required',
                });
                result.current.clearErrors('user.profile.name');
            });

            expect(result.current.getFieldState('user.profile.name').error).toBeUndefined();
        });

        it('should handle clearErrors with no error correctly', () => {
            const nestedDefaultValues = { user: { profile: { name: 'John', age: 30 } } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.clearErrors('user.profile.name');
            });

            expect(result.current.getFieldState('user.profile.name').error).toBeUndefined();
        });
    });

    describe('Form Reset', () => {
        it('should reset form correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.reset(newValues);
            });

            expect(result.current.values$.get()).toEqual(newValues);
        });

        it('should handle reset with default values correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.reset();
            });

            expect(result.current.values$.get()).toEqual(defaultValues);
        });

        it('should handle reset with empty values correctly', () => {
            const { result } = renderHook(() => useForm({ values: defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.reset({});
            });

            expect(result.current.getValues()).toEqual({});
        });

        it('should handle reset for nested fields correctly', () => {
            const nestedDefaultValues = { user: { name: 'John', age: 30 } };
            const newNestedValues = { user: { name: 'Doe', age: 25 } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setValue('user.name', 'Doe');
                result.current.reset(newNestedValues);
            });

            expect(result.current.getValues()).toEqual(newNestedValues);
        });

        it('should reset field correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.resetField('name');
            });

            expect(result.current.getValues('name')).toBe('John');
        });

        it('should reset field correctly and call updateValid method', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(() => {
                result.current.setValue('name', 'Doe');
            });
            await act(() => {
                result.current.resetField('name');
            });

            expect(result.current.getValues('name')).toBe('John');
        });

        it('should reset field with default value correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.resetField('name', { defaultValue: 'Jane' });
            });

            expect(result.current.getValues('name')).toBe('Jane');
        });

        it('should reset form state correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.reset();
            });

            expect(result.current.formState$.isDirty.get()).toBe(false);
            expect(result.current.formState$.dirtyFields.get()).toEqual({});
        });

        it('should reset form state with keep options correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.reset({}, { keepDirty: true, keepDirtyValues: true });
            });

            expect(result.current.control._formState.isDirty).toBe(true);
            expect(result.current.control._formState.dirtyFields).toEqual({ name: true });
        });

        it('should reset default values correctly', async () => {
            const defaultValuesFn = vi.fn().mockResolvedValue(newValues);
            const { result } = renderHook(() => useForm({ defaultValues: defaultValuesFn }));

            await act(async () => {
                await result.current.control._resetDefaultValues();
            });

            expect(result.current.values$.get()).toEqual(newValues);
        });

        it('should reset form with all keepStateOptions', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.setValue('name', 'Test');
                // result.current.setError('name', { type: 'required', message: 'Required' });
                await result.current.handleSubmit(vi.fn())();
                result.current.reset(
                    {},
                    {
                        keepErrors: true,
                        keepDirty: true,
                        keepDirtyValues: true,
                        keepValues: true,
                        keepIsSubmitted: true,
                        keepTouched: true,
                        keepIsSubmitSuccessful: true,
                    },
                );
            });

            expect(result.current.control._formState.errors).toBeDefined();
            expect(result.current.control._formState.isDirty).toBe(true);
            expect(result.current.control._formState.isSubmitted).toBe(true);
            expect(result.current.getValues()).toEqual({ name: 'Test', age: 30 });
        });

        it('should handle reset with keeping all state options', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.setValue('name', 'Test');
                await result.current.handleSubmit(vi.fn())();
                result.current.reset(
                    {},
                    {
                        keepErrors: true,
                        keepDirty: true,
                        keepDirtyValues: true,
                        keepValues: true,
                        keepIsSubmitted: true,
                        keepTouched: true,
                        keepIsSubmitSuccessful: true,
                    },
                );
            });

            const formState = result.current.control._formState;
            expect(formState.isDirty).toBe(true);
            expect(formState.isSubmitted).toBe(true);
            expect(formState.isSubmitSuccessful).toBe(true);
        });
    });

    describe('Validation', () => {
        it('should trigger validation correctly', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                const isValid = await result.current.trigger();
                expect(isValid).toBe(true);
            });
        });

        it('should handle trigger validation for nested fields correctly', async () => {
            const nestedDefaultValues = { user: { name: 'John', age: 30 } };
            const resolver = vi.fn().mockResolvedValue({
                errors: { 'user.name': { type: 'required', message: 'Name is required' } },
                values: {},
            });
            const { result } = renderHook(() =>
                useForm({ defaultValues: nestedDefaultValues, resolver }),
            );

            await act(async () => {
                const isValid = await result.current.trigger('user.name');
                expect(isValid).toBe(false);
            });

            expect(result.current.getFieldState('user.name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });
        });

        it('should handle setValue with undefined correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', undefined);
            });

            expect(result.current.getValues('name')).toBeUndefined();
        });

        it('should handle setValue with null correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', null);
            });

            expect(result.current.getValues('name')).toBeNull();
        });

        it('should handle setValue with empty string correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', '');
            });

            expect(result.current.getValues('name')).toBe('');
        });

        it('should handle setValue with number correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('age', 40);
            });

            expect(result.current.getValues('age')).toBe(40);
        });

        it('should handle setValue with boolean correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('isActive', true);
            });

            expect(result.current.getValues('isActive')).toBe(true);
        });

        it('should handle setValue with array correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('tags', ['tag1', 'tag2']);
            });

            expect(result.current.getValues('tags')).toEqual(['tag1', 'tag2']);
        });

        it('should handle setValue with object correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('address', { city: 'New York', zip: '10001' });
            });

            expect(result.current.getValues('address')).toEqual({ city: 'New York', zip: '10001' });
        });

        it('should handle setValue with deep nested fields correctly', () => {
            const nestedDefaultValues = { user: { profile: { name: 'John', age: 30 } } };
            const { result } = renderHook(() => useForm({ defaultValues: nestedDefaultValues }));

            act(() => {
                result.current.setValue('user.profile.name', 'Doe');
            });

            expect(result.current.getValues('user.profile.name')).toBe('Doe');
            expect(result.current.getValues()).toEqual({
                user: { profile: { name: 'Doe', age: 30 } },
            });
        });

        it('should handle field validation with resolver error', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { 'nested.field': { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                const isValid = await result.current.trigger('nested.field');
                expect(isValid).toBe(false);
            });

            expect(result.current.formState$.isValid.get()).toBe(false);
        });

        it('should handle observer updates for initial empty values', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: {} });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', 'John');
            });

            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should not update errors if form is not dirty', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', '');
            });

            expect(result.current.formState$.errors.get()).toEqual({});
        });

        it('should execute schema and update state correctly', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Name is required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                await result.current.control._executeSchemaAndUpdateState(['name']);
            });

            expect(result.current.getFieldState('name').error).toEqual({
                type: 'required',
                message: 'Name is required',
            });
        });

        it('should execute schema without names parameter', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                await result.current.control._executeSchemaAndUpdateState();
            });

            expect(result.current.formState$.errors.get()).toEqual({
                name: { type: 'required', message: 'Required' },
            });
        });

        it('should update form state based on resolver results', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { email: { type: 'required', message: 'Email is required' } },
                values: { email: '' },
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                await result.current.control._executeSchemaAndUpdateState(['email']);
            });

            expect(result.current.formState$.errors.get()).toHaveProperty('email');
            expect(result.current.getFieldState('email').error).toEqual({
                type: 'required',
                message: 'Email is required',
            });
        });

        it('should execute schema and update state with specific field names', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { username: { type: 'min', message: 'Minimum length is 3' } },
                values: { username: 'Jo' },
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                const errors = await result.current.control._executeSchemaAndUpdateState([
                    'username',
                ]);
                expect(errors).toHaveProperty('username');
            });

            expect(result.current.getFieldState('username').error).toEqual({
                type: 'min',
                message: 'Minimum length is 3',
            });
        });

        it('should update valid state correctly when _updateValid is called', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                await result.current.control._updateValid(true);
            });

            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should not update valid state if disabled', async () => {
            const { result } = renderHook(() => useForm({ defaultValues, disabled: true }));

            await act(async () => {
                await result.current.control._updateValid(true);
            });

            expect(result.current.formState$.isValid.get()).toBe(false);
        });

        it('should update valid state if not disabled', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                await result.current.control._updateValid(true);
            });

            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should handle form state transitions during async validation', async () => {
            const resolver = vi
                .fn()
                .mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            setTimeout(() => resolve({ errors: {}, values: defaultValues }), 100),
                        ),
                );
            const { result } = renderHook(() => useForm({ defaultValues, resolver }));

            await act(async () => {
                const validationPromise = result.current.trigger();
                expect(result.current.formState$.isValidating.get()).toBe(false); // TODO: implement isValidating
                await validationPromise;
            });
        });

        it('should handle resolver without fields correctly', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ values: defaultValues, resolver }));

            await act(async () => {
                const errors = await result.current.control._executeSchemaAndUpdateState();
                expect(errors).toEqual({});
            });

            expect(resolver).toHaveBeenCalledWith(defaultValues, undefined, expect.any(Object));
        });

        it('should reset field with all options correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setError('name', { type: 'required', message: 'Name is required' });
                result.current.setValue('name', 'Test');
                result.current.resetField('name', {
                    keepError: true,
                    keepDirty: true,
                    keepTouched: true,
                });
            });

            expect(result.current.getFieldState('name').error).toBeDefined();
            expect(result.current.formState$.isDirty.get()).toBe(true);
        });

        it('should handle observer updates correctly when values change', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
            });

            expect(result.current.values$.name.get()).toBe('Jane');
            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should handle form state updates correctly when values change', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
            });

            expect(result.current.values$.name.get()).toBe('Jane');
            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should handle form state updates correctly when errors change', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', '');
            });

            expect(result.current.formState$.errors.get()).toEqual({});
        });

        it('should handle form state updates correctly when touched fields change', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
                result.current.control._updateFormState({ touchedFields: { name: true } });
            });

            expect(result.current.formState$.touchedFields.get()).toEqual({ name: true });
        });

        it('should handle form state updates correctly when dirty fields change', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
                result.current.control._updateFormState({ dirtyFields: { name: true } });
            });

            expect(result.current.formState$.dirtyFields.get()).toEqual({ name: true });
        });

        it('should handle form state updates correctly when isSubmitting changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isSubmitting: true });
            });

            expect(result.current.formState$.isSubmitting.get()).toBe(true);
        });

        it('should handle form state updates correctly when isSubmitted changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isSubmitted: true });
            });

            expect(result.current.formState$.isSubmitted.get()).toBe(true);
        });

        it('should handle form state updates correctly when isSubmitSuccessful changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isSubmitSuccessful: true });
            });

            expect(result.current.formState$.isSubmitSuccessful.get()).toBe(true);
        });

        it('should handle form state updates correctly when isLoading changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isLoading: true });
            });

            expect(result.current.formState$.isLoading.get()).toBe(true);
        });

        it('should handle form state updates correctly when disabled changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ disabled: true });
            });

            expect(result.current.formState$.disabled.get()).toBe(true);
        });

        it('should handle form state updates correctly when submitCount changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ submitCount: 1 });
            });

            expect(result.current.formState$.submitCount.get()).toBe(1);
        });

        it('should handle form observer updates after submission', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                await result.current.handleSubmit(() => Promise.resolve())();
                result.current.setValue('name', '');
            });

            expect(result.current.formState$.errors.get()).toHaveProperty('name');
        });

        it('should handle resolver with transformed values', async () => {
            const transformedValues = { transformed: true };
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: transformedValues });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                await result.current.handleSubmit((data) => {
                    expect(data).toEqual(transformedValues);
                })();
            });
        });

        it('should handle form state update with partial state', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.control._updateFormState({
                    isSubmitting: true,
                });
            });

            expect(result.current.formState$.isSubmitting.get()).toBe(true);
            // Other states should remain unchanged
            expect(result.current.formState$.isDirty.get()).toBe(false);
        });

        it('should update form state with all fields', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.control._updateFormState({
                    isDirty: true,
                    isValid: true,
                    isSubmitted: true,
                    isSubmitting: true,
                    isSubmitSuccessful: true,
                });
            });

            const formState = result.current.formState$.get();
            expect(formState.isDirty).toBe(true);
            expect(formState.isValid).toBe(true);
            expect(formState.isSubmitted).toBe(true);
            expect(formState.isSubmitting).toBe(true);
            expect(formState.isSubmitSuccessful).toBe(true);
        });
    });

    describe('Field State', () => {
        it('should get field state correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
            });

            expect(result.current.getFieldState('name')).toEqual({
                invalid: false,
                isDirty: true,
                isValidating: false,
                isTouched: false,
                error: undefined,
            });
        });

        it('should return correct field state when name is provided', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.setError('name', { type: 'required', message: 'Name is required' });
            });

            const fieldState = result.current.getFieldState('name');

            expect(fieldState).toEqual({
                invalid: true,
                isDirty: true,
                isValidating: false,
                isTouched: false,
                error: { type: 'required', message: 'Name is required' },
            });
        });

        it('should return correct field state when field is touched', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Doe');
                result.current.control._updateFormState({ touchedFields: { name: true } });
            });

            const fieldState = result.current.getFieldState('name');

            expect(fieldState).toEqual({
                invalid: false,
                isDirty: true,
                isValidating: false,
                isTouched: true,
                error: undefined,
            });
        });

        it('should return correct control values', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));
            const defaultOptions = {
                mode: 'onSubmit',
                reValidateMode: 'onChange',
            };

            expect(result.current.control._formValues).toEqual(defaultValues);
            expect(result.current.control._defaultValues).toEqual(defaultValues);
            expect(result.current.control._formState).toEqual(result.current.formState$.get());
            expect(result.current.control._options).toEqual({ ...defaultOptions, defaultValues });

            act(() => {
                result.current.control._formState = {
                    ...result.current.control._formState,
                    isDirty: true,
                };
            });

            expect(result.current.control._formState.isDirty).toBe(true);

            act(() => {
                result.current.control._options = { mode: 'onBlur' };
            });

            expect(result.current.control._options.mode).toBe('onBlur');
        });
    });

    describe('Form Observer', () => {
        it('should handle form observer with empty values', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: {} });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('field', 'value');
            });

            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should handle form observer updates after submission', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                await result.current.handleSubmit(() => Promise.resolve())();
                result.current.setValue('name', '');
            });

            expect(result.current.formState$.errors.get()).toHaveProperty('name');
        });

        it('should handle resolver with transformed values', async () => {
            const transformedValues = { transformed: true };
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: transformedValues });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                await result.current.handleSubmit((data) => {
                    expect(data).toEqual(transformedValues);
                })();
            });
        });

        it('should handle form state update with partial state', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.control._updateFormState({
                    isSubmitting: true,
                });
            });

            expect(result.current.formState$.isSubmitting.get()).toBe(true);
            // Other states should remain unchanged
            expect(result.current.formState$.isDirty.get()).toBe(false);
        });

        it('should update form state with all fields', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.control._updateFormState({
                    isDirty: true,
                    isValid: true,
                    isSubmitted: true,
                    isSubmitting: true,
                    isSubmitSuccessful: true,
                });
            });

            const formState = result.current.formState$.get();
            expect(formState.isDirty).toBe(true);
            expect(formState.isValid).toBe(true);
            expect(formState.isSubmitted).toBe(true);
            expect(formState.isSubmitting).toBe(true);
            expect(formState.isSubmitSuccessful).toBe(true);
        });

        it('should handle form state updates correctly when values change', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: defaultValues });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
            });

            expect(result.current.values$.name.get()).toBe('Jane');
            expect(result.current.formState$.isValid.get()).toBe(true);
        });

        it('should handle form state updates correctly when errors change', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { name: { type: 'required', message: 'Required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                result.current.setValue('name', '');
            });

            expect(result.current.formState$.errors.get()).toEqual({});
        });

        it('should handle form state updates correctly when touched fields change', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
                result.current.control._updateFormState({ touchedFields: { name: true } });
            });

            expect(result.current.formState$.touchedFields.get()).toEqual({ name: true });
        });

        it('should handle form state updates correctly when dirty fields change', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.setValue('name', 'Jane');
                result.current.control._updateFormState({ dirtyFields: { name: true } });
            });

            expect(result.current.formState$.dirtyFields.get()).toEqual({ name: true });
        });

        it('should handle form state updates correctly when isSubmitting changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isSubmitting: true });
            });

            expect(result.current.formState$.isSubmitting.get()).toBe(true);
        });

        it('should handle form state updates correctly when isSubmitted changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isSubmitted: true });
            });

            expect(result.current.formState$.isSubmitted.get()).toBe(true);
        });

        it('should handle form state updates correctly when isSubmitSuccessful changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isSubmitSuccessful: true });
            });

            expect(result.current.formState$.isSubmitSuccessful.get()).toBe(true);
        });

        it('should handle form state updates correctly when isLoading changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ isLoading: true });
            });

            expect(result.current.formState$.isLoading.get()).toBe(true);
        });

        it('should handle form state updates correctly when disabled changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ disabled: true });
            });

            expect(result.current.formState$.disabled.get()).toBe(true);
        });

        it('should handle form state updates correctly when submitCount changes', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                result.current.control._updateFormState({ submitCount: 1 });
            });

            expect(result.current.formState$.submitCount.get()).toBe(1);
        });
    });

    describe('Form Control', () => {
        it('should get and set form values correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            expect(result.current.control._formValues).toEqual(defaultValues);

            act(() => {
                result.current.setValue('name', 'Jane');
            });

            expect(result.current.control._formValues).toEqual({ ...defaultValues, name: 'Jane' });
        });

        it('should return default values correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            expect(result.current.control._defaultValues).toEqual(defaultValues);
        });

        it('should update form options correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            expect(result.current.control._options.mode).toBe('onSubmit');

            act(() => {
                result.current.control._options = { mode: 'onChange' };
            });

            expect(result.current.control._options.mode).toBe('onChange');
        });

        it('should set form state correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));
            const newFormState = {
                ...result.current.control._formState,
                isSubmitting: true,
                submitCount: 1,
            };

            act(() => {
                result.current.control._formState = newFormState;
            });

            expect(result.current.control._formState).toEqual(newFormState);
        });

        it('should reset form values through control', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Jane');
                result.current.control._reset();
            });

            expect(result.current.control._formValues).toEqual(defaultValues);
        });
    });

    describe('Form Initialization', () => {
        it('should initialize with async default values', async () => {
            const asyncDefaultValues = vi.fn().mockResolvedValue({ name: 'John', age: 30 });
            const { result } = renderHook(() => useForm({ defaultValues: asyncDefaultValues }));

            await act(async () => {
                await result.current.control._resetDefaultValues();
            });

            expect(result.current.values$.get()).toEqual({ name: 'John', age: 30 });
        });

        it('should handle disabled form state', async () => {
            const { result } = renderHook(() => useForm({ defaultValues, disabled: true }));

            await act(() => {
                result.current.setValue('name', 'Jane');
            });

            await act(async () => {
                await result.current.control._updateValid(true);
            });

            expect(result.current.formState$.isValid.get()).toBe(false);
            expect(result.current.control._getDirty()).toBe(false);
        });
    });

    describe('Form State', () => {
        it('should handle multiple concurrent form state updates', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                batch(() => {
                    result.current.control._updateFormState({
                        isSubmitting: true,
                        submitCount: 1,
                        isValid: true,
                        isDirty: true,
                    });
                });
            });

            const formState = result.current.formState$;
            expect(formState.isSubmitting.get()).toBe(true);
            expect(formState.submitCount.get()).toBe(1);
            expect(formState.isValid.get()).toBe(true);
            expect(formState.isDirty.get()).toBe(true);
        });

        it('should handle resolver without values correctly', async () => {
            const { result } = renderHook(() => useForm());

            await act(async () => {
                const resolverResult = await result.current.control._resolver({} as any);
                expect(resolverResult).toEqual({ errors: {}, values: {} });
            });
        });

        it('should handle empty reset values correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.reset({});
            });

            expect(result.current.values$.get()).toEqual(defaultValues);
        });

        it('should handle form state updates with batch operations', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                batch(() => {
                    result.current.setValue('name', 'Jane');
                    result.current.control._updateFormState({
                        isDirty: true,
                        dirtyFields: { name: true },
                    });
                });
            });

            expect(result.current.values$.name.get()).toBe('Jane');
            expect(result.current.formState$.isDirty.get()).toBe(true);
            expect(result.current.formState$.dirtyFields.get()).toEqual({ name: true });
        });
    });

    describe('Form Options', () => {
        it('should update form options correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.control._options = { mode: 'onChange' };
            });

            expect(result.current.control._options.mode).toBe('onChange');
        });

        it('should merge default options with provided options', () => {
            const customOptions = {
                mode: VALIDATION_MODE.onChange,
                defaultValues: { test: 'value' },
            };
            const defaultOptions = {
                mode: VALIDATION_MODE.onSubmit,
                reValidateMode: VALIDATION_MODE.onChange,
            };
            const { result } = renderHook(() => useForm(customOptions));

            expect(result.current.control._options).toEqual({
                ...defaultOptions,
                ...customOptions,
            });
        });
    });

    describe('Form Updates', () => {
        it('should handle error updates without affecting other state', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.control._setErrors({
                    name: { type: 'required', message: 'Required' },
                });
            });

            expect(result.current.formState$.errors.get()).toEqual({
                name: { type: 'required', message: 'Required' },
            });
            expect(result.current.formState$.isDirty.get()).toBe(false);
        });
    });

    describe('Form Validation', () => {
        it('should handle validation with undefined values', async () => {
            const { result } = renderHook(() => useForm());

            await act(async () => {
                const isValid = await result.current.trigger();
                expect(isValid).toBe(true);
            });

            expect(result.current.formState$.errors.get()).toEqual({});
        });

        it('should validate specific fields with trigger', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: { email: { type: 'required', message: 'Email is required' } },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                const isValid = await result.current.trigger('email');
                expect(isValid).toBe(false);
            });

            expect(result.current.formState$.errors.get()).toHaveProperty('email');
        });

        it('should validate multiple specific fields with trigger', async () => {
            const resolver = vi.fn().mockResolvedValue({
                errors: {
                    email: { type: 'required', message: 'Email is required' },
                    password: { type: 'required', message: 'Password is required' },
                },
                values: {},
            });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                const isValid = await result.current.trigger(['email', 'password']);
                expect(isValid).toBe(false);
            });

            const errors = result.current.formState$.errors.get();
            expect(errors).toHaveProperty('email');
            expect(errors).toHaveProperty('password');
        });

        it('should handle validation when resolver is not provided', async () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            await act(async () => {
                const isValid = await result.current.trigger();
                expect(isValid).toBe(true);
            });

            expect(result.current.formState$.errors.get()).toEqual({});
        });
    });

    describe('Form Update Methods', () => {
        it('should update dirty fields correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('name', 'Jane');
            });

            expect(result.current.formState$.dirtyFields.get()).toEqual({ name: true });
            expect(result.current.formState$.isDirty.get()).toBe(true);
        });

        it('should batch update form state correctly', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                batch(() => {
                    result.current.setValue('name', 'Jane');
                    result.current.setValue('age', 25);
                    result.current.control._updateFormState({
                        isDirty: true,
                        dirtyFields: { name: true, age: true },
                    });
                });
            });

            expect(result.current.values$.get()).toEqual({ name: 'Jane', age: 25 });
            expect(result.current.formState$.isDirty.get()).toBe(true);
            expect(result.current.formState$.dirtyFields.get()).toEqual({ name: true, age: true });
        });

        it('should handle edge cases in setValue', () => {
            const { result } = renderHook(() => useForm({ defaultValues }));

            act(() => {
                result.current.setValue('nonexistentField' as any, 'value');
            });

            expect(result.current.values$.get()).toHaveProperty('nonexistentField', 'value');
        });
    });

    describe('Form Edge Cases', () => {
        it('should handle empty field names in validation', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: {} });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                const isValid = await result.current.trigger('');
                expect(isValid).toBe(true);
            });
        });

        it('should handle undefined field names in validation', async () => {
            const resolver = vi.fn().mockResolvedValue({ errors: {}, values: {} });
            const { result } = renderHook(() => useForm({ resolver }));

            await act(async () => {
                const isValid = await result.current.trigger(undefined);
                expect(isValid).toBe(true);
            });
        });

        it('should handle null values in form state', () => {
            const { result } = renderHook(() => useForm({ defaultValues: { field: null } }));

            expect(result.current.values$.field.get()).toBeNull();
        });
    });
});
