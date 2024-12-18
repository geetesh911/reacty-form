import { act, renderHook, RenderResult } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { UseFieldArrayReturn, UseFormReturn } from '../../types';
import { useFieldArray } from '../use-field-array.hook';
import { useForm } from '../use-form.hook';

describe('useFieldArray', () => {
    let formResult: RenderResult<UseFormReturn<{ items: never[] }, any, undefined>>;
    let fieldArrayResult: RenderResult<
        Omit<UseFieldArrayReturn<{ items: never[] }, never, 'id'>, 'fields'>
    >;

    beforeEach(() => {
        formResult = renderHook(() => useForm({ values: { items: [] } })).result;
        fieldArrayResult = renderHook(() =>
            useFieldArray({ name: 'items' as never, form: formResult.current }),
        ).result;
    });

    describe('Appending and Prepending', () => {
        it('should append value correctly', () => {
            act(() => {
                fieldArrayResult.current.append({ name: 'Item 1' });
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Item 1' }]);
        });

        it('should prepend value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.prepend({ name: 'Item 0' });
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 0' },
                { name: 'Item 1' },
            ]);
        });

        it('should handle appending multiple values correctly', () => {
            act(() => {
                fieldArrayResult.current.append([{ name: 'Item 1' }, { name: 'Item 2' }]);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 1' },
                { name: 'Item 2' },
            ]);
        });

        it('should handle prepending multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.prepend([{ name: 'Item 0' }, { name: 'Item -1' }]);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item -1' },
                { name: 'Item 0' },
                { name: 'Item 1' },
            ]);
        });
    });

    describe('Inserting and Removing', () => {
        it('should insert value correctly', () => {
            act(() => {
                fieldArrayResult.current.insert(0, { name: 'Item 0' });
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Item 0' }]);
        });

        it('should remove value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.remove(0);
            });

            expect(formResult.current.getValues('items')).toEqual([]);
        });

        it('should remove ll values without index correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.remove();
            });

            expect(formResult.current.getValues('items')).toEqual([]);
        });

        it('should handle inserting multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.insert(0, [{ name: 'Item 0' }, { name: 'Item -1' }]);
            });

            expect(formResult.current.getValues('items')).toEqual([
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
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.remove([0, 2]);
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Item 2' }]);
        });
    });

    describe('Updating Values', () => {
        it('should update value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.update(0, { name: 'Updated Item 1' });
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Updated Item 1' }]);
        });

        it('should handle updating multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.update(0, { name: 'Updated Item 1' });
                fieldArrayResult.current.update(1, { name: 'Updated Item 2' });
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Updated Item 1' },
                { name: 'Updated Item 2' },
            ]);
        });
    });

    describe('Swapping and Moving', () => {
        it('should swap values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.swap(0, 1);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 2' },
                { name: 'Item 1' },
            ]);
        });

        it('should move value correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.move(0, 1);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 2' },
                { name: 'Item 1' },
            ]);
        });
    });

    describe('Bulk Operations', () => {
        it('should handle replacing with multiple values correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.replace([{ name: 'Item 2' }, { name: 'Item 3' }]);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 2' },
                { name: 'Item 3' },
            ]);
        });
    });

    describe('Edge Cases', () => {
        it('should handle swapping the same index correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.swap(0, 0);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 1' },
                { name: 'Item 2' },
            ]);
        });

        it('should handle moving to the same index correctly', () => {
            const formResult = renderHook(() =>
                useForm({ values: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] } }),
            ).result;
            const fieldArrayResult = renderHook(() =>
                useFieldArray({ name: 'items' as never, form: formResult.current }),
            ).result;

            act(() => {
                fieldArrayResult.current.move(0, 0);
            });

            expect(formResult.current.getValues('items')).toEqual([
                { name: 'Item 1' },
                { name: 'Item 2' },
            ]);
        });

        it('should handle appending to an empty array correctly', () => {
            act(() => {
                fieldArrayResult.current.append({ name: 'Item 1' });
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Item 1' }]);
        });

        it('should handle removing from an empty array correctly', () => {
            act(() => {
                fieldArrayResult.current.remove(0);
            });

            expect(formResult.current.getValues('items')).toEqual([]);
        });

        it('should handle replacing an empty array correctly', () => {
            act(() => {
                fieldArrayResult.current.replace([{ name: 'Item 1' }]);
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Item 1' }]);
        });

        it('should handle updating an empty array correctly', () => {
            act(() => {
                fieldArrayResult.current.update(0, { name: 'Updated Item 1' });
            });

            expect(formResult.current.getValues('items')).toEqual([{ name: 'Updated Item 1' }]);
        });

        it('should handle swapping in an empty array correctly', () => {
            act(() => {
                fieldArrayResult.current.swap(0, 1);
            });

            expect(formResult.current.getValues('items')).toEqual([]);
        });

        it('should handle moving in an empty array correctly', () => {
            act(() => {
                fieldArrayResult.current.move(0, 1);
            });

            expect(formResult.current.getValues('items')).toEqual([]);
        });
    });
});
