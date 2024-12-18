import type { ObserveEventCallback } from '@legendapp/state';
import { useObserve } from '@legendapp/state/react';

import { useFormContext } from '../providers/form.provider';
import type { FieldPath, FieldValues, UseFormReturn } from '../types';

export type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
    name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[];
    form?: UseFormReturn<TFieldValues>;
};

export function useWatch<TFieldValues extends FieldValues>(
    props: UseWatchProps<TFieldValues>,
    callback: (e: ObserveEventCallback<TFieldValues>) => void,
): ReturnType<typeof useObserve<TFieldValues>> {
    const formContext = useFormContext<TFieldValues>();
    const { name, form = formContext } = props ?? {};

    if (!form) {
        throw new Error('Form is not provided');
    }

    const observer = form.getObservable(name as FieldPath<TFieldValues>);

    return useObserve(observer, callback);
}
