import { useMemo } from 'react';
import { batch, type Observable } from '@legendapp/state';
import { useObservable, useObserve } from '@legendapp/state/react';

import { VALIDATION_MODE } from '../constants';
import type {
    FieldError,
    FieldErrors,
    FieldPath,
    FieldValues,
    FormState,
    InternalFieldName,
    PathValue,
    Resolver,
    ResolverResult,
    UseFormGetFieldState,
    UseFormGetObservable,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormProps,
    UseFormReturn,
    UseFormSetValue,
} from '../types';
import type {
    DefaultValues,
    GetIsDirty,
    UseFormClearErrors,
    UseFormReset,
    UseFormResetField,
    UseFormSetError,
    UseFormTrigger,
} from '../types/form';
import {
    cloneObject,
    convertToArrayPayload,
    deepEqual,
    get,
    isEmptyObject,
    isFunction,
    isString,
    isUndefined,
    set,
    setObservable,
    unsetObservable,
} from '../utils';

const defaultOptions = {
    mode: VALIDATION_MODE.onSubmit,
    reValidateMode: VALIDATION_MODE.onChange,
};

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://per-form.com/docs/useform)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues extends FieldValues | undefined = undefined,
>(
    props?: Readonly<UseFormProps<TFieldValues>>,
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
    let _options = { ...defaultOptions, ...props };
    const initialValues = useMemo<Partial<TFieldValues>>(
        () => cloneObject(props?.defaultValues ?? props?.values ?? {}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    const { disabled = false, values, defaultValues = {}, resetOptions, resolver } = _options;
    const values$ = useObservable<Partial<TFieldValues>>(
        cloneObject(values ?? (defaultValues as Partial<TFieldValues>)),
    ) as Observable<Partial<TFieldValues>>;
    const formState$ = useObservable<FormState<TFieldValues>>({
        errors: {},
        touchedFields: {},
        dirtyFields: {},
        validatingFields: {},
        isDirty: false,
        isValid: false,
        isSubmitting: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isLoading: false,
        isValidating: false,
        disabled,
        submitCount: 0,
    });
    const {
        errors: errors$,
        touchedFields: touchedFields$,
        dirtyFields: dirtyFields$,
        isDirty: isDirty$,
        isValid: isValid$,
        isSubmitting: isSubmitting$,
        isSubmitted: isSubmitted$,
        isSubmitSuccessful: isSubmitSuccessful$,
        isLoading: isLoading$,
        disabled: disabled$,
        submitCount: submitCount$,
    } = formState$ as unknown as Observable<FormState<FieldValues>>;

    const _setErrors = (errors: FieldErrors<FieldValues>): void => {
        errors$.set(errors);
    };

    const _resolver = (fieldValues: TFieldValues): Promise<ResolverResult<TFieldValues>> => {
        if (!resolver) {
            return Promise.resolve({ errors: {}, values: fieldValues });
        }

        return (resolver as Resolver<TFieldValues, TTransformedValues>)(fieldValues, undefined, {
            fields: {},
            shouldUseNativeValidation: undefined,
        }) as Promise<ResolverResult<TFieldValues>>;
    };

    const _getDirty: GetIsDirty = (name, data) => {
        const value$ = get(values$, name);

        if (disabled) {
            return false;
        }

        name && data && value$.set(data);

        return !deepEqual(values$.get(), initialValues);
    };

    const _updateValid = async (shouldUpdateValid?: boolean) => {
        if (!disabled && (isValid$.get() || shouldUpdateValid)) {
            if (!resolver) {
                return;
            }
            const isValid = isEmptyObject((await _resolver(initialValues as TFieldValues)).errors);

            if (isValid !== isValid$.get()) {
                isValid$.set(isValid);
            }
        }
    };

    const _updateFormState = (updatedFormState: Partial<FormState<TFieldValues>>) => {
        const previousFormState = formState$.get();

        formState$.set({
            ...(previousFormState as FormState<TFieldValues>),
            ...updatedFormState,
        } as typeof previousFormState);
    };

    const _resetDefaultValues = () =>
        isFunction(defaultValues) &&
        (_options.defaultValues as () => Promise<TFieldValues>)().then((values: TFieldValues) => {
            reset(values, resetOptions);
        });

    const _executeSchemaAndUpdateState = async (names?: Array<InternalFieldName>) => {
        const { errors } = await _resolver(values$.get() as TFieldValues);

        if (names) {
            for (const name of names) {
                const error: FieldError = get(errors, name);

                if (!error || isEmptyObject(error)) {
                    unsetObservable(errors$, name);

                    continue;
                }

                setObservable(errors$, name, error);
            }
        } else {
            _setErrors(errors);
        }

        return errors;
    };

    useObserve(values$, async ({ value }) => {
        const { errors } = await _resolver(value as TFieldValues);

        if (!isDirty$.get() || disabled === true) {
            return;
        }

        batch(() => {
            if (isSubmitted$.get()) {
                _setErrors(errors);
            }

            if (isEmptyObject(errors)) {
                isValid$.set(true);

                return;
            }

            isValid$.set(false);
        });
    });

    const handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues> =
        (onValid, onInvalid) => async (e) => {
            if (e) {
                e.preventDefault?.();
                e.persist?.();
            }

            isLoading$.set(true);

            let onValidError: unknown;

            const { errors, values: fieldValues } = await _resolver(values$.get());

            batch(async () => {
                _setErrors(errors);

                isDirty$.set(true);
                isSubmitting$.set(true);
                disabled$.set(true);
            });

            const isEmptyErrors = isEmptyObject(errors);

            if (isEmptyErrors) {
                try {
                    await onValid(fieldValues as TFieldValues, e);

                    isSubmitSuccessful$.set(true);
                } catch (error) {
                    onValidError = error;
                }
            }

            batch(() => {
                isSubmitting$.set(false);
                disabled$.set(false);
                isSubmitted$.set(true);
                submitCount$.set(submitCount$.get() + 1);
                isLoading$.set(false);
            });

            if (!isEmptyErrors) {
                await onInvalid?.(errors as FieldErrors<TFieldValues>, e);
            }

            if (onValidError) {
                throw onValidError;
            }
        };

    const setValue: UseFormSetValue<TFieldValues> = (name, value): void => {
        const field: Observable = get(values$, name);

        batch(() => {
            field.set(value);
            isDirty$.set(true);

            setObservable(dirtyFields$, name, true);
        });
    };

    const getValues: UseFormGetValues<TFieldValues> = (
        fieldNames?: FieldPath<TFieldValues> | ReadonlyArray<FieldPath<TFieldValues>>,
    ) => {
        if (isUndefined(fieldNames)) {
            return values$.get();
        }

        if (isString(fieldNames)) {
            return (get(values$, fieldNames) as Observable)?.get();
        }

        return fieldNames.map((name) => (get(values$, name) as Observable)?.get());
    };

    const getObservable: UseFormGetObservable<TFieldValues> = (
        fieldNames?: FieldPath<TFieldValues> | ReadonlyArray<FieldPath<TFieldValues>>,
    ) => {
        if (isUndefined(fieldNames)) {
            return values$;
        }

        if (isString(fieldNames)) {
            return get(values$, fieldNames);
        }

        return fieldNames.map((name) => get(values$, name));
    };

    const peekValues: UseFormGetValues<TFieldValues> = (
        fieldNames?: FieldPath<TFieldValues> | ReadonlyArray<FieldPath<TFieldValues>>,
    ) => {
        if (isUndefined(fieldNames)) {
            return values$.peek();
        }

        if (isString(fieldNames)) {
            return (get(values$, fieldNames) as Observable)?.peek();
        }

        return fieldNames.map((name) => (get(values$, name) as Observable)?.peek());
    };

    // TODO: Implement focus on error
    const setError: UseFormSetError<TFieldValues> = (name, error) => {
        const currentError: Observable<FieldError> = get(errors$, name);

        const { message, type, ...restOfErrorTree } = currentError;

        setObservable(errors$, name, { ...restOfErrorTree, ...error });
    };

    const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
        if (!name) {
            errors$.set({});

            return;
        }

        const nameArr = convertToArrayPayload(name);

        for (const fieldName of nameArr) {
            const currentError: Observable<FieldError> = get(errors$, fieldName as string);

            if (!currentError?.get()) {
                continue;
            }

            currentError.delete();
        }
    };

    // TODO: Implement focus on error
    const trigger: UseFormTrigger<TFieldValues> = async (name) => {
        let isValid: boolean;
        let validationResult = !resolver;
        const fieldNames = convertToArrayPayload(name) as InternalFieldName[];

        if (resolver) {
            const errors = await _executeSchemaAndUpdateState(
                isUndefined(name) ? name : fieldNames,
            );

            isValid = isEmptyObject(errors);
            validationResult = name ? !fieldNames.some((name) => get(errors, name)) : isValid;

            isValid$.set(isValid);

            return validationResult;
        }

        isValid$.set(true);

        return validationResult;
    };

    const resetField: UseFormResetField<TFieldValues> = (name, options = {}) => {
        if (isUndefined(options.defaultValue)) {
            setValue(name, cloneObject(get(initialValues, name)));
        } else {
            setValue(
                name,
                options.defaultValue as PathValue<TFieldValues, FieldPath<TFieldValues>>,
            );

            set(initialValues, name, cloneObject(options.defaultValue));
        }

        if (!options.keepTouched) {
            const field = get(touchedFields$, name);

            field?.set(false);
        }

        if (!options.keepDirty) {
            const field = get(dirtyFields$, name);

            field?.set(false);
            isDirty$.set(
                options.defaultValue
                    ? _getDirty(name, cloneObject(get(initialValues, name)))
                    : _getDirty(),
            );
        }

        if (!options.keepError) {
            const field = get(dirtyFields$, name);
            const isValid = isValid$.get();

            field?.delete();

            if (isValid) {
                _updateValid();
            }
        }
    };

    const reset: UseFormReset<TFieldValues> = (
        formValues,
        keepStateOptions = resetOptions,
    ): void => {
        const updatedValues = formValues ? cloneObject(formValues) : defaultValues;
        const cloneUpdatedValues = cloneObject(updatedValues);
        const isEmptyResetValues = isEmptyObject(formValues);
        const values = isEmptyResetValues ? defaultValues : cloneUpdatedValues;

        batch(() => {
            isSubmitting$.set(false);

            if (!keepStateOptions?.keepErrors) {
                errors$.set({});
            }

            if (!keepStateOptions?.keepTouched) {
                touchedFields$.set({});
            }

            if (!keepStateOptions?.keepDirtyValues) {
                dirtyFields$.set({});
            }

            if (!keepStateOptions?.keepDirty) {
                isDirty$.set(false);
            }

            if (!keepStateOptions?.keepValues) {
                (values$ as Observable).set(cloneObject(values));
            }

            if (!keepStateOptions?.keepIsSubmitted) {
                isSubmitted$.set(false);
            }

            if (!keepStateOptions?.keepIsSubmitSuccessful) {
                isSubmitSuccessful$.set(false);
            }
        });
    };

    const getFieldState: UseFormGetFieldState<TFieldValues> = (name) => {
        return {
            invalid: !!get(errors$, name)?.get(),
            isDirty: !!get(dirtyFields$, name)?.get(),
            error: get(errors$, name)?.get() as FieldError,
            isValidating: false, // need to implement
            isTouched: !!get(touchedFields$, name)?.get(),
        };
    };

    return {
        formState$,
        values$,
        handleSubmit,
        setValue,
        getValues,
        getObservable,
        peekValues,
        setError,
        clearErrors,
        trigger,
        resetField,
        reset,
        getFieldState,
        control: {
            getFieldState,
            handleSubmit,
            setError,
            _executeSchemaAndUpdateState,
            _getDirty,
            _updateValid,
            _setErrors,
            _resetDefaultValues,
            _reset: reset,
            _updateFormState,
            _resolver,
            get _formValues() {
                return values$.get();
            },
            get _defaultValues() {
                return defaultValues as Partial<DefaultValues<TFieldValues>>;
            },
            get _formState() {
                return formState$.get() as FormState<TFieldValues>;
            },
            set _formState(value) {
                formState$.set(value as Parameters<typeof formState$.set>[0]);
            },
            get _options() {
                return _options;
            },
            set _options(value) {
                _options = {
                    ...defaultOptions,
                    ...props,
                    ...value,
                };
            },
        },
    };
}
