import React from 'react';
import { createContext, useContext } from 'react';

import type { useForm } from '../hooks/use-form.hook';
import type { FieldValues, UseFormReturn } from '../types';

export const FormContext = createContext<ReturnType<typeof useForm> | null>(null);

export function FormProvider<
    TFieldValues extends FieldValues,
    TTransformedValues extends FieldValues | undefined = undefined,
>({
    children,
    form,
}: {
    children: React.ReactNode;
    form: ReturnType<typeof useForm<TFieldValues, TTransformedValues>>;
}): React.ReactNode {
    return (
        <FormContext.Provider value={(form as unknown as ReturnType<typeof useForm>) ?? null}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext<
    TFieldValues extends FieldValues,
    TTransformedValues extends FieldValues | undefined = undefined,
>(): UseFormReturn<TFieldValues, TTransformedValues> {
    const formContext = useContext(FormContext);

    if (!formContext) {
        throw new Error('useFormContext must be used within a FormProvider');
    }

    return formContext as unknown as ReturnType<typeof useForm<TFieldValues, TTransformedValues>>;
}
