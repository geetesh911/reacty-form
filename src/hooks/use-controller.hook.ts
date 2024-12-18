import { batch, type Observable } from '@legendapp/state';

import type { ControllerProps } from '../components/controller.component';
import { getEventValue } from '../logic/get-event-value';
import { useFormContext } from '../providers/form.provider';
import type {
    ControllerRenderProps,
    FieldPath,
    FieldPathValue,
    FieldValues,
    FormState,
    PathValue,
    UseFormGetValues,
    UseFormSetValue,
} from '../types';
import { get } from '../utils';

export type UseControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerRenderProps<TFieldValues, TName>, 'ref'> & {
    formatValue?: (value: unknown) => FieldPathValue<TFieldValues, TName>;
};

export function useController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>): UseControllerProps<TFieldValues, TName> {
    const formContext = useFormContext();
    const { name, form = formContext, formatValue } = props ?? {};

    if (!form) {
        throw new Error('Form is not provided');
    }

    const formState$ = form.formState$ as Observable<FormState<FieldValues>>;

    const onChange = (e: unknown): void => {
        let value = getEventValue(e) as PathValue<TFieldValues, TName>;

        if (formatValue) {
            value = formatValue(value);
        }

        (form.setValue as UseFormSetValue<TFieldValues>)(name, value);

        batch(async () => {
            if (
                formState$.isSubmitted.get()
                    ? form.control._options.reValidateMode === 'onChange'
                    : form.control._options.mode === 'onChange'
            ) {
                form.control._executeSchemaAndUpdateState();
            }

            formState$.isDirty.set(true);
            get(formState$.dirtyFields, name)?.set(true);
        });
    };

    const onBlur = (): void => {
        batch(async () => {
            const field = get(formState$.touchedFields, name);

            if (form.control._options.mode === 'onTouched' && !field?.get()) {
                form.control._executeSchemaAndUpdateState();
            }

            if (
                formState$.isSubmitted.get()
                    ? form.control._options.reValidateMode === 'onBlur'
                    : form.control._options.mode === 'onBlur'
            ) {
                form.control._executeSchemaAndUpdateState();
            }

            field?.get()
                ? field.set(true)
                : formState$.touchedFields.set({ ...formState$.touchedFields.get(), [name]: true });
        });
    };

    return {
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
}
