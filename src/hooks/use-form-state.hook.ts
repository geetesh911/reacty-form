import { useFormContext } from '../providers/form.provider';
import type { FieldValues, FormState, UseFormReturn } from '../types';

export type UseFormStateProps<TFieldValues extends FieldValues> = Partial<{
    form?: UseFormReturn<TFieldValues>;
}>;

export type UseFormStateReturn<TFieldValues extends FieldValues> = FormState<TFieldValues>;

export function useFormState<TFieldValues extends FieldValues = FieldValues>(
    props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
    const formContext = useFormContext();
    const { form = formContext } = props ?? {};

    if (!form) {
        throw new Error('Form is not provided');
    }

    return form.formState$.get() as UseFormStateReturn<TFieldValues>;
}
