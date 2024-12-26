import { act, renderHook } from '@testing-library/react-hooks';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { UseFieldArrayReturn, UseFormReturn } from '../../types';
import { useFieldArray } from '../use-field-array.hook';
import { useForm } from '../use-form.hook';
import { useFormContext } from '../use-form-context.hook';

vi.mock('../use-form-context.hook', () => ({
    useFormContext: vi.fn(),
}));

describe('useFieldArray', () => {
    let formResult: UseFormReturn<{ items: string[] }, any, undefined>;
    let fieldArrayResult: Omit<UseFieldArrayReturn<{ items: string[] }, never, 'id'>, 'fields'>;

    beforeEach(() => {
        formResult = renderHook(() => useForm({ values: { items: [] } })).result.current;
        fieldArrayResult = renderHook(() =>
            useFieldArray({ name: 'items' as never, form: formResult }),
        ).result.current;
    });

    describe('Appending and Prepending', () => {
        it('should append value correctly', () => {
            act(() => {
                fieldArrayResult.append({ name: 'Item 1' });
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 1' }]);
        });

        it('should prepend value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.prepend({ name: 'Item 0' });
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 0' }, { name: 'Item 1' }]);
        });

        it('should handle appending multiple values correctly', () => {
            act(() => {
                fieldArrayResult.append([{ name: 'Item 1' }, { name: 'Item 2' }]);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 1' }, { name: 'Item 2' }]);
        });

        it('should handle prepending multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.prepend([{ name: 'Item 0' }, { name: 'Item -1' }]);
            });

            expect(formResult.getValues('items')).toEqual([
                { name: 'Item -1' },
                { name: 'Item 0' },
                { name: 'Item 1' },
            ]);
        });
    });

    describe('Inserting and Removing', () => {
        it('should insert value correctly', () => {
            act(() => {
                fieldArrayResult.insert(0, { name: 'Item 0' });
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 0' }]);
        });

        it('should remove value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.remove(0);
            });

            expect(formResult.getValues('items')).toEqual([]);
        });

        it('should remove ll values without index correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.remove();
            });

            expect(formResult.getValues('items')).toEqual([]);
        });

        it('should handle inserting multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.insert(0, [{ name: 'Item 0' }, { name: 'Item -1' }]);
            });

            expect(formResult.getValues('items')).toEqual([
                { name: 'Item 0' },
                { name: 'Item -1' },
                { name: 'Item 1' },
            ]);
        });

        it('should handle removing multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({
                    values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }, { name: 'Item 3' }] },
                }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.remove([0, 2]);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 2' }]);
        });
    });

    describe('Updating Values', () => {
        it('should update value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.update(0, { name: 'Updated Item 1' });
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Updated Item 1' }]);
        });

        it('should handle updating multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.update(0, { name: 'Updated Item 1' });
                fieldArrayResult.update(1, { name: 'Updated Item 2' });
            });

            expect(formResult.getValues('items')).toEqual([
                { name: 'Updated Item 1' },
                { name: 'Updated Item 2' },
            ]);
        });
    });

    describe('Swapping and Moving', () => {
        it('should swap values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.swap(0, 1);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 2' }, { name: 'Item 1' }]);
        });

        it('should move value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.move(0, 1);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 2' }, { name: 'Item 1' }]);
        });
    });

    describe('Bulk Operations', () => {
        it('should handle replacing with multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.replace([{ name: 'Item 2' }, { name: 'Item 3' }]);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 2' }, { name: 'Item 3' }]);
        });
    });

    describe('Edge Cases', () => {
        it('should handle swapping the same index correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.swap(0, 0);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 1' }, { name: 'Item 2' }]);
        });

        it('should handle moving to the same index correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result.current;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult }),
            ).result.current;

            act(() => {
                fieldArrayResult.move(0, 0);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 1' }, { name: 'Item 2' }]);
        });

        it('should handle appending to an empty array correctly', () => {
            act(() => {
                fieldArrayResult.append({ name: 'Item 1' });
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 1' }]);
        });

        it('should handle removing from an empty array correctly', () => {
            act(() => {
                fieldArrayResult.remove(0);
            });

            expect(formResult.getValues('items')).toEqual([]);
        });

        it('should handle replacing an empty array correctly', () => {
            act(() => {
                fieldArrayResult.replace([{ name: 'Item 1' }]);
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Item 1' }]);
        });

        it('should handle updating an empty array correctly', () => {
            act(() => {
                fieldArrayResult.update(0, { name: 'Updated Item 1' });
            });

            expect(formResult.getValues('items')).toEqual([{ name: 'Updated Item 1' }]);
        });

        it('should handle swapping in an empty array correctly', () => {
            act(() => {
                fieldArrayResult.swap(0, 1);
            });

            expect(formResult.getValues('items')).toEqual([]);
        });

        it('should handle moving in an empty array correctly', () => {
            act(() => {
                fieldArrayResult.move(0, 1);
            });

            expect(formResult.getValues('items')).toEqual([]);
        });

        it('should throw an error if Form is not provided, either pass the form in props or wrap you form inside FormProvider and context is not available', () => {
            (useFormContext as Mock).mockReturnValue(undefined);

            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never }),
            ).result;

            expect(fieldArrayResult.error).toEqual(
                new Error(
                    'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
                ),
            );
        });
    });
});
