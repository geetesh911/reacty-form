import { batch, type Observable, type RecursiveValueOrFunction } from '@legendapp/state';

import type {
    FieldArray,
    FieldArrayPath,
    FieldValues,
    UseFieldArrayMove,
    UseFieldArrayProps as _UseFieldArrayProps,
    UseFieldArrayRemove,
    UseFieldArrayReplace,
    UseFieldArrayReturn,
    UseFieldArraySwap,
    UseFieldArrayUpdate,
    UseFormReturn,
} from '../types';
import { cloneObject, convertToArrayPayload, get } from '../utils';

export interface UseFieldArrayProps<
    TFieldValues extends FieldValues = FieldValues,
    TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
    TKeyName extends string = 'id',
> extends Pick<_UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>, 'name'> {
    form: UseFormReturn<TFieldValues>;
}

export function useFieldArray<
    TFieldValues extends FieldValues = FieldValues,
    TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
    TKeyName extends string = 'id',
>({
    name,
    form,
}: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>): Omit<
    UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName>,
    'fields'
> {
    const _getWithIndex = (
        index: number,
    ): Observable<Partial<FieldArray<FieldValues, FieldArrayPath<FieldValues>>>> => {
        return get(form.values$, `${name}.${index}`) as Observable<
            Partial<FieldArray<FieldValues, FieldArrayPath<FieldValues>>>
        >;
    };

    const _get = (): Observable<Array<Partial<FieldArray<TFieldValues, TFieldArrayName>>>> => {
        return get(form.values$, name) as Observable<
            Array<Partial<FieldArray<TFieldValues, TFieldArrayName>>>
        >;
    };

    const append = (
        value:
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    ): void => {
        const appendValue = convertToArrayPayload(cloneObject(value));

        batch(() => {
            for (const item of appendValue) {
                _get()?.push(item);
            }
        });
    };

    const prepend = (
        value:
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    ): void => {
        const appendValue = convertToArrayPayload(cloneObject(value));

        batch(() => {
            for (const item of appendValue) {
                _get()?.unshift(item);
            }
        });
    };

    const insert = (
        index: number,
        value:
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    ): void => {
        const appendValue = convertToArrayPayload(cloneObject(value));

        batch(() => {
            _get()?.splice(index, 0, ...appendValue);
        });
    };

    const remove: UseFieldArrayRemove = (index?: number | Array<number>): void => {
        if (index === undefined) {
            _get().set([]);
        }

        let indexCounter = 0;
        const indexes = convertToArrayPayload(index) as Array<number>;

        batch(() => {
            for (const i of indexes) {
                _get().splice(i - indexCounter, 1);

                indexCounter++;
            }
        });
    };

    const replace: UseFieldArrayReplace<TFieldValues, TFieldArrayName> = (
        value:
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    ): void => {
        const updatedFieldArrayValues = convertToArrayPayload(cloneObject(value));

        _get().set(
            updatedFieldArrayValues as RecursiveValueOrFunction<
                Partial<FieldArray<TFieldValues, TFieldArrayName>>[]
            >,
        );
    };

    const update: UseFieldArrayUpdate<TFieldValues, TFieldArrayName> = (
        index: number,
        value:
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>
            | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    ): void => {
        _getWithIndex(index).set(value);
    };

    const swap: UseFieldArraySwap = (indexA: number, indexB: number): void => {
        batch(() => {
            const temp = _getWithIndex(indexA)?.peek();

            _getWithIndex(indexA).set(_getWithIndex(indexB)?.peek());
            _getWithIndex(indexB).set(temp);
        });
    };

    const move: UseFieldArrayMove = (from: number, to: number): void => {
        batch(() => {
            const arr = _get();

            if (arr.length === 0) {
                return;
            }

            arr.splice(to, 0, _get().splice(from, 1)[0]);
        });
    };

    return { append, prepend, insert, remove, replace, update, swap, move };
}
