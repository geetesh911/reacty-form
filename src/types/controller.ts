import type React from 'react';

import type {
    ChangeHandler,
    FieldError,
    FieldPath,
    FieldPathValue,
    FieldValues,
    RefCallBack,
    UseFormReturn,
    UseFormStateReturn,
} from './';

export type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type ControllerFieldState = {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
};

export type ControllerRenderProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    onChange: ChangeHandler;
    onBlur: ChangeHandler;
    value: FieldPathValue<TFieldValues, TName>;
    disabled?: boolean;
    name: TName;
    ref?: RefCallBack;
};

export type UseControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    form?: UseFormReturn<TFieldValues>;
    setValueAs?: (value: any) => FieldPathValue<TFieldValues, TName>;
    name: TName;
    defaultValue?: FieldPathValue<TFieldValues, TName>;
    disabled?: boolean;
};

export type UseControllerReturn<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    field: ControllerRenderProps<TFieldValues, TName>;
    formState: UseFormStateReturn<TFieldValues>;
    fieldState: ControllerFieldState;
};

/**
 * Render function to provide the control for the field.
 *
 * @returns all the event handlers, and relevant field and form state.
 *
 * @example
 * ```tsx
 * const { field, fieldState, formState } = useController();
 *
 * <Controller
 *   render={({ field, formState, fieldState }) => ({
 *     <input
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       name={field.name}
 *       ref={field.ref} // optional for focus management
 *     />
 *   })}
 * />
 * ```
 */
export type ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TComponent extends React.FC = React.FC,
> = {
    name: TName;
    form?: UseFormReturn<TFieldValues>;
    component?: TComponent;
    componentProps?: ExtractProps<TComponent>;
    setValueAs?: (value: unknown) => FieldPathValue<TFieldValues, TName>;
    render?: ({
        field,
        fieldState,
        formState,
    }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<TFieldValues>;
    }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TName>;

export type DefaultProps = {
    onChange: ChangeHandler;
    onBlur: ChangeHandler;
    value: unknown;
    className?: string;
    type?: string;
} & Record<PropertyKey, unknown>;
