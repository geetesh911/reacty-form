import React, { createContext } from 'react';

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
    form: UseFormReturn<TFieldValues, undefined, TTransformedValues>;
}): React.ReactNode {
    return (
        <FormContext.Provider value={(form as unknown as ReturnType<typeof useForm>) ?? null}>
            {children}
        </FormContext.Provider>
    );
}
