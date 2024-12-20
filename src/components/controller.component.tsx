import { type ChangeEvent, createElement } from 'react';
import { observer } from '@legendapp/state/react';
import type { UnknownRecord } from 'type-fest';

import { useController } from '../hooks/use-controller.hook';
import type { FieldPath, FieldPathValue, FieldValues, UseFormReturn } from '../types';

export type DefaultProps = {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    value: unknown;
    className?: string;
    type?: string;
} & UnknownRecord;

export type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type ControllerRenderProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    onChange: (...e: any[]) => void;
    onBlur: () => void;
    value: FieldPathValue<TFieldValues, TName>;
};

export type ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TComponent extends React.FC = React.FC,
> = {
    name: TName;
    form?: UseFormReturn<TFieldValues>;
    component?: TComponent;
    componentProps?: ExtractProps<TComponent>;
    formatValue?: (value: unknown) => FieldPathValue<TFieldValues, TName>;
    render?: (props: ControllerRenderProps<TFieldValues, TName>) => React.ReactElement;
};

const ControllerComponent = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TComponent extends React.FC = React.FC,
>({
    name,
    form,
    component,
    componentProps,
    render,
    formatValue,
}: ControllerProps<TFieldValues, TName, TComponent>): React.ReactNode => {
    const { field } = useController<TFieldValues, TName>({ name, form, formatValue });

    return render
        ? render(field)
        : createElement(component as React.FC<DefaultProps>, { ...componentProps, ...field });
};

export const Controller = observer(ControllerComponent);
