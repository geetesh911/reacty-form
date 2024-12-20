import { batch, type Observable } from '@legendapp/state';

import type { ControllerProps } from '../components/controller.component';
import { getEventValue } from '../logic/get-event-value';
import type {
    FieldPath,
    FieldValues,
    FormState,
    PathValue,
    UseControllerReturn,
    UseFormGetValues,
    UseFormReturn,
    UseFormSetValue,
    UseFormStateReturn,
} from '../types';
import { get, setObservable } from '../utils';

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
>(props: ControllerProps<TFieldValues, TName>): UseControllerReturn<TFieldValues, TName> {
    const formContext = useFormContext();
    const { name, form = formContext, formatValue } = props ?? {};

    if (!form) {
        throw new Error('Form is not provided');
    }

    const formState$ = form.formState$ as Observable<FormState<FieldValues>>;

    const onChange = async (e: unknown): Promise<void> => {
        let value = getEventValue(e) as PathValue<TFieldValues, TName>;

        if (formatValue) {
            value = formatValue(value);
        }

        (form.setValue as UseFormSetValue<TFieldValues>)(name, value);

        if (
            formState$.isSubmitted.peek()
                ? form.control._options.reValidateMode === 'onChange'
                : form.control._options.mode === 'onChange'
        ) {
            await form.control._executeSchemaAndUpdateState([name]);
        }
    };

    const onBlur = async (): Promise<void> => {
        batch(async () => {
            const field = get(formState$.touchedFields, name);

            if (form.control._options.mode === 'onTouched' && !field?.peek()) {
                await form.control._executeSchemaAndUpdateState([name]);
            }

            if (
                formState$.isSubmitted.peek()
                    ? form.control._options.reValidateMode === 'onBlur'
                    : form.control._options.mode === 'onBlur'
            ) {
                await form.control._executeSchemaAndUpdateState([name]);
            }

            field?.peek() ? field.set(true) : setObservable(formState$.touchedFields, name, true);
        });
    };

    const field = {
        onChange,
        onBlur,
        get value() {
            return (
                (form.getValues as UseFormGetValues<TFieldValues>)(name) ??
                (get(form.control._options.defaultValues, name) as PathValue<TFieldValues, TName>)
            );
        },
        name,
        get disabled() {
            return form.control._formState.disabled;
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
