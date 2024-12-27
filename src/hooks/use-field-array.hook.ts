import { batch, type Observable, type RecursiveValueOrFunction } from '@legendapp/state';

import type {
    FieldArray,
    FieldArrayPath,
    FieldValues,
    UseFieldArrayMove,
    UseFieldArrayProps,
    UseFieldArrayRemove,
    UseFieldArrayReplace,
    UseFieldArrayReturn,
    UseFieldArraySwap,
    UseFieldArrayUpdate,
} from '../types';
import { cloneObject, convertToArrayPayload, get } from '../utils';

import { useFormContext } from './use-form-context.hook';

/**
 * A custom hook that exposes convenient methods to perform operations with a list of dynamic inputs that need to be appended, updated, removed etc. • [Demo](https://codesandbox.io/s/per-form-usefieldarray-ssugn) • [Video](https://youtu.be/4MrbfGSFY2A)
 *
 * @remarks
 * [API](https://per-form.com/docs/usefieldarray)
 *
 * @param props - useFieldArray props
 *
 * @returns methods - functions to manipulate with the Field Arrays (dynamic inputs) {@link UseFieldArrayReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const form = useForm({
 *     defaultValues: {
 *       test: []
 *     }
 *   });
 *   const { fields, append } = useFieldArray({
 *     form,
 *     name: "test"
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit(data => console.log(data))}>
 *       {fields.map((item, index) => (
 *          <input key={item.id} {...form.register(`test.${index}.firstName`)}  />
 *       ))}
 *       <button type="button" onClick={() => append({ firstName: "bill" })}>
 *         append
 *       </button>
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useFieldArray<
    TFieldValues extends FieldValues = FieldValues,
    TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
>(
    props: UseFieldArrayProps<TFieldValues, TFieldArrayName>,
): Omit<UseFieldArrayReturn<TFieldValues, TFieldArrayName>, 'fields'> {
    const formContext = useFormContext();
    const { name, form = formContext } = props ?? {};

    if (!form) {
        throw new Error(
            'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
        );
    }

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
