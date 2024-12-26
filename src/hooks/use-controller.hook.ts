import { useMemo } from 'react';
import { type Observable } from '@legendapp/state';

import type {
    FieldPath,
    FieldValues,
    FormState,
    PathValue,
    UseControllerProps,
    UseControllerReturn,
    UseFormGetValues,
    UseFormRegister,
    UseFormReturn,
    UseFormStateReturn,
} from '../types';
import { get, isBoolean } from '../utils';

import { useFormContext } from './use-form-context.hook';

/**
 * Custom hook to work with controlled component, this function provide you with both form and field level state. Re-render is isolated at the hook level.
 *
 * @remarks
 * [API](https://per-form.com/docs/usecontroller)
 *
 * @param props - the path name to the form field value, and validation rules.
 *
 * @returns field properties, field and form state. {@link UseControllerReturn}
 *
 * @example
 * ```tsx
 * function Input(props) {
 *   const { field, fieldState, formState } = useController(props);
 *   return (
 *     <div>
 *       <input {...field} placeholder={props.name} />
 *       <p>{fieldState.isTouched && "Touched"}</p>
 *       <p>{formState.isSubmitted ? "submitted" : ""}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: UseControllerProps<TFieldValues, TName>): UseControllerReturn<TFieldValues, TName> {
    const formContext = useFormContext();
    const { name, form = formContext, setValueAs, defaultValue, disabled } = props ?? {};

    if (!form) {
        throw new Error(
            'Form is not provided, either pass the form in props or wrap you form inside FormProvider',
        );
    }

    const formState$ = form.formState$ as Observable<FormState<FieldValues>>;

    const registerProps = useMemo(
        () =>
            (form.register as UseFormRegister<TFieldValues>)(name, {
                setValueAs,
                ...(isBoolean(props.disabled) ? { disabled: props.disabled } : {}),
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [name, formState$.disabled.peek()],
    );

    const field = {
        onChange: registerProps.onChange,
        onBlur: registerProps.onBlur,
        ref: registerProps.ref,
        get value() {
            return (
                (form.getValues as UseFormGetValues<TFieldValues>)(name) ??
                defaultValue ??
                (get(form.control._options.defaultValues, name) as PathValue<TFieldValues, TName>)
            );
        },
        name,
        get disabled() {
            const isFormDisabled = form.control._formState.disabled;

            return isBoolean(disabled) || isFormDisabled ? isFormDisabled || disabled : false;
        },
    };

    return {
        field,
        get fieldState() {
            return (form as UseFormReturn<FieldValues>).getFieldState(name);
        },
        get formState() {
            return form.control._formState as UseFormStateReturn<TFieldValues>;
        },
    };
}
