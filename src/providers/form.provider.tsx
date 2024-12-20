import React, { createContext } from 'react';

import type { useForm } from '../hooks/use-form.hook';
import type { FieldValues } from '../types';

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
