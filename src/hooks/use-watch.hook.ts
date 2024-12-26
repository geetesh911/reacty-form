import type { ObserveEventCallback } from '@legendapp/state';
import { useObserve } from '@legendapp/state/react';

import type { FieldPath, FieldValues, UseWatchProps } from '../types';

import { useFormContext } from './use-form-context.hook';

export function useWatch<TFieldValues extends FieldValues>(
    props: UseWatchProps<TFieldValues>,
    callback: (e: ObserveEventCallback<TFieldValues>) => void,
): ReturnType<typeof useObserve<TFieldValues>> {
    const formContext = useFormContext<TFieldValues>();
    const { name, form = formContext } = props ?? {};

    if (!form) {
        throw new Error(
            'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
        );
    }

    const observer = form.getObservable(name as FieldPath<TFieldValues>);

    return useObserve(observer, callback);
}
