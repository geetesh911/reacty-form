import { useMemo } from 'react';
import { batch, isBoolean, type Observable, ObservableHint } from '@legendapp/state';
import { useObservable, useObserve } from '@legendapp/state/react';

import { VALIDATION_MODE } from '../constants';
import { getDirtyFields, getEventValue, getFieldValue, getFieldValueAs } from '../logic';
import { getRuleValue } from '../logic/get-rule-value';
import type {
    Field,
    FieldError,
    FieldErrors,
    FieldPath,
    FieldRefs,
    FieldValues,
    FormState,
    InternalFieldName,
    Path,
    PathValue,
    Ref,
    Resolver,
    ResolverResult,
    UseFormGetFieldState,
    UseFormGetObservable,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormProps,
    UseFormReturn,
    UseFormSetFocus,
    UseFormSetValue,
} from '../types';
import type {
    Control,
    DefaultValues,
    GetIsDirty,
    SetFieldValue,
    SetValueConfig,
    UseFormClearErrors,
    UseFormRegister,
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
    isCheckBoxInput,
    isEmptyObject,
    isFileInput,
    isFunction,
    isHTMLElement,
    isMultipleSelect,
    isNullOrUndefined,
    isRadioOrCheckbox,
    isString,
    isUndefined,
    live,
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
    const fields$ = useObservable<FieldRefs>({});
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
            criteriaMode: _options.criteriaMode,
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

    const updateTouchAndDirty = (
        name: InternalFieldName,
        fieldValue: unknown,
        isBlurEvent?: boolean,
        shouldDirty?: boolean,
    ): Partial<Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>> => {
        let shouldUpdateField = false;
        let isPreviousDirty = false;
        const output: Partial<FormState<TFieldValues>> & { name: string } = {
            name,
        };

        batch(() => {
            if (disabled) {
                const disabledField$ = get(fields$, name);
                const disabledField = Boolean(disabledField$.get()?._f?.disabled);

                if (!isBlurEvent || shouldDirty) {
                    const isDirty = isDirty$.get();

                    if (isDirty) {
                        isPreviousDirty = isDirty;
                        const isDirtyValue = _getDirty();
                        output.isDirty = isDirtyValue;

                        isDirty$.set(isDirtyValue);

                        shouldUpdateField = isPreviousDirty !== output.isDirty;
                    }

                    const isCurrentFieldPristine =
                        disabledField || deepEqual(get(defaultValues, name), fieldValue);
                    const dirtyFields = dirtyFields$.get();
                    const dirtyField$ = get(dirtyFields$, name);

                    isPreviousDirty = !!(!disabledField && get(dirtyFields, name));
                    isCurrentFieldPristine || disabledField
                        ? dirtyField$?.delete()
                        : dirtyField$.set(true);
                    output.dirtyFields = dirtyFields as Partial<
                        FormState<TFieldValues>
                    >['dirtyFields'];
                    shouldUpdateField =
                        shouldUpdateField ||
                        (dirtyFields && isPreviousDirty !== !isCurrentFieldPristine);
                }
            }

            if (isBlurEvent) {
                const isPreviousFieldTouched$ = get(touchedFields$, name);
                const isPreviousFieldTouched = isPreviousFieldTouched$.get();
                const touchedFields = touchedFields$.get();

                if (!isPreviousFieldTouched) {
                    isPreviousFieldTouched$.set(isBlurEvent);
                    output.touchedFields = touchedFields as Partial<
                        FormState<TFieldValues>
                    >['touchedFields'];
                    shouldUpdateField =
                        shouldUpdateField ||
                        (touchedFields && isPreviousFieldTouched !== isBlurEvent);
                }
            }
        });

        return shouldUpdateField ? output : {};
    };

    const _updateDisabledField: Control<TFieldValues>['_updateDisabledField'] = ({
        disabled,
        name,
        field,
        fields,
        value,
    }) => {
        if (isBoolean(disabled)) {
            const inputValue = disabled
                ? undefined
                : isUndefined(value)
                  ? getFieldValue(field ? field._f : get(fields, name)._f)
                  : value;
            if (disabled || (!disabled && !isUndefined(inputValue))) {
                const value = get(values$, name);

                value.set(inputValue);
            }

            updateTouchAndDirty(name, inputValue, false, false);
        }
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

    const setFieldValue = (
        name: InternalFieldName,
        value: SetFieldValue<TFieldValues>,
        options: SetValueConfig = {},
    ) => {
        const field$: Observable<Field> = get(fields$, name);
        const field: Field = field$.get();
        let fieldValue: unknown = value;

        if (field) {
            const fieldReference = field._f;

            if (fieldReference) {
                !fieldReference.disabled &&
                    setObservable(
                        values$ as Observable,
                        name,
                        getFieldValueAs(value, fieldReference),
                    );

                fieldValue =
                    isHTMLElement(fieldReference.ref) && isNullOrUndefined(value) ? '' : value;

                if (isMultipleSelect(fieldReference.ref)) {
                    [...fieldReference.ref.options].forEach(
                        (optionRef) =>
                            (optionRef.selected = (fieldValue as InternalFieldName[]).includes(
                                optionRef.value,
                            )),
                    );
                } else if (fieldReference.refs) {
                    if (isCheckBoxInput(fieldReference.ref)) {
                        fieldReference.refs.length > 1
                            ? fieldReference.refs.forEach(
                                  (checkboxRef) =>
                                      (!checkboxRef.defaultChecked || !checkboxRef.disabled) &&
                                      (checkboxRef.checked = Array.isArray(fieldValue)
                                          ? !!(fieldValue as []).find(
                                                (data: string) => data === checkboxRef.value,
                                            )
                                          : fieldValue === checkboxRef.value),
                              )
                            : fieldReference.refs[0] &&
                              (fieldReference.refs[0].checked = !!fieldValue);
                    } else {
                        fieldReference.refs.forEach(
                            (radioRef: HTMLInputElement) =>
                                (radioRef.checked = radioRef.value === fieldValue),
                        );
                    }
                } else if (isFileInput(fieldReference.ref)) {
                    fieldReference.ref.value = '';
                } else {
                    fieldReference.ref.value = fieldValue;
                }
            }
        }

        (options.shouldDirty || options.shouldTouch) &&
            updateTouchAndDirty(name, fieldValue, options.shouldTouch, options.shouldDirty);

        options.shouldValidate && trigger(name as Path<TFieldValues>);
    };

    const updateValidAndValue = (
        name: InternalFieldName,
        shouldSkipSetValueAs: boolean,
        value?: unknown,
        ref?: Ref,
    ) => {
        const field$: Observable<Field> = get(fields$, name);
        const field: Field = field$.get();

        if (field) {
            const defaultValue =
                get(values$, name)?.get() ??
                (isUndefined(value) ? get(defaultValues, name) : value);

            isUndefined(defaultValue) ||
            (ref && (ref as HTMLInputElement).defaultChecked) ||
            shouldSkipSetValueAs
                ? setObservable(
                      values$ as Observable,
                      name,
                      shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f),
                  )
                : setFieldValue(name, defaultValue);

            _updateValid();
        }
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

    const setValue: UseFormSetValue<TFieldValues> = (name, value, options = {}): void => {
        const field: Observable = get(values$, name);
        const cloneValue = cloneObject(value);

        batch(() => {
            field.set(cloneValue);

            setFieldValue(name, cloneValue, options);

            isDirty$.set(_getDirty(name, value));

            dirtyFields$.set(getDirtyFields(defaultValues, values$.get()));
        });
    };

    const setFocus: UseFormSetFocus<TFieldValues> = (name, options = {}) => {
        const field = get(fields$, name)?.get();
        const fieldReference = field?._f;

        if (fieldReference) {
            const fieldRef = fieldReference.refs ? fieldReference.refs[0] : fieldReference.ref;

            if (fieldRef.focus) {
                fieldRef.focus();
                options.shouldSelect && isFunction(fieldRef.select) && fieldRef.select();
            }
        }
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

    const setError: UseFormSetError<TFieldValues> = (name, error, options) => {
        const currentError: FieldError = get(errors$, name)?.get() ?? {};

        const { message, type, ...restOfErrorTree } = currentError;

        setObservable(errors$, name, { ...restOfErrorTree, ...error });

        if (options?.shouldFocus) {
            const field$: Observable<Field> = get(fields$, name);

            const field = field$.get();

            if (field?._f?.ref?.focus) {
                (field._f.ref.focus as (options?: FocusOptions) => void)();
            }
        }
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

    const trigger: UseFormTrigger<TFieldValues> = async (name, options) => {
        let isValid = !resolver;
        let validationResult = !resolver;
        const fieldNames = convertToArrayPayload(name) as InternalFieldName[];

        if (resolver) {
            const errors = await _executeSchemaAndUpdateState(
                isUndefined(name) ? name : fieldNames,
            );

            isValid = isEmptyObject(errors);
            validationResult = name ? !fieldNames.some((name) => get(errors, name)) : isValid;

            isValid$.set(isValid);
        }

        if (options?.shouldFocus && !validationResult) {
            batch(() => {
                for (const fieldName of fieldNames) {
                    const field$: Observable<Field> = get(fields$, fieldName);

                    const field = field$.get();

                    if (field?._f?.ref?.focus) {
                        (field._f.ref.focus as (options?: FocusOptions) => void)();
                    }
                }
            });
        }

        isValid$.set(isValid);

        return validationResult;
    };

    const resetField: UseFormResetField<TFieldValues> = (name, options = {}) => {
        batch(() => {
            if (isUndefined(options.defaultValue)) {
                setObservable(values$ as Observable, name, cloneObject(get(initialValues, name)));
            } else {
                setObservable(values$ as Observable, name, options.defaultValue);

                set(initialValues, name, cloneObject(options.defaultValue));
            }

            if (!options.keepTouched) {
                const field = get(touchedFields$, name);

                field?.set(false);
            }

            if (!options.keepDirty) {
                const field$ = get(dirtyFields$, name);

                field$?.set(false);
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
        });
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
            isTouched: !!get(touchedFields$, name)?.get(),
        };
    };

    const register: UseFormRegister<TFieldValues> = (name, options = {}) => {
        const field$ = get(fields$, name);
        const field = field$.get() ?? {};
        const disabledIsDefined = isBoolean(disabled) || isBoolean(_options.disabled);

        setObservable(
            fields$,
            name,
            ObservableHint.opaque({
                ...field,
                _f: {
                    ...(field && field._f ? field._f : { ref: { name } }),
                    name,
                    mount: true,
                    ...options,
                },
            }),
        );

        if (field) {
            _updateDisabledField({
                field,
                disabled: isBoolean(options.disabled) ? options.disabled : _options.disabled,
                name,
                value: options.value,
            });
        }

        return {
            ...(disabledIsDefined ? { disabled: options.disabled || _options.disabled } : {}),
            ...((_options.progressive ?? true)
                ? {
                      required: !!options.required,
                      min: getRuleValue(options.min),
                      max: getRuleValue(options.max),
                      minLength: getRuleValue<number>(options.minLength) as number,
                      maxLength: getRuleValue(options.maxLength) as number,
                      pattern: getRuleValue(options.pattern) as string,
                  }
                : {}),
            name,
            onChange: async (e: { target: any }) => {
                let value = getEventValue(e);

                if (options.setValueAs) {
                    value = options.setValueAs(value);
                }

                setValue(name, value as PathValue<TFieldValues, FieldPath<TFieldValues>>);

                if (
                    isSubmitted$.peek()
                        ? _options.reValidateMode === 'onChange'
                        : _options.mode === 'onChange'
                ) {
                    await _executeSchemaAndUpdateState([name]);
                }

                return undefined;
            },
            onBlur: async () => {
                batch(async () => {
                    const field = get(touchedFields$, name);

                    if (_options.mode === 'onTouched' && !field?.peek()) {
                        await _executeSchemaAndUpdateState([name]);
                    }

                    if (
                        isSubmitted$.peek()
                            ? _options.reValidateMode === 'onBlur'
                            : _options.mode === 'onBlur'
                    ) {
                        await _executeSchemaAndUpdateState([name]);
                    }

                    field?.peek() ? field.set(true) : setObservable(touchedFields$, name, true);
                });

                return undefined;
            },
            ref: (ref: HTMLInputElement | null): void => {
                if (ref) {
                    const field = field$.get() ?? {};

                    const fieldRef = isUndefined(ref.value)
                        ? ref.querySelectorAll
                            ? (ref.querySelectorAll('input,select,textarea')[0] as Ref) || ref
                            : ref
                        : ref;
                    const radioOrCheckbox = isRadioOrCheckbox(fieldRef);
                    const refs = field._f?.refs || [];

                    if (
                        radioOrCheckbox
                            ? refs.find((option: Ref) => option === fieldRef)
                            : fieldRef === field._f?.ref
                    ) {
                        return;
                    }

                    setObservable(
                        fields$,
                        name,
                        ObservableHint.opaque({
                            _f: {
                                ...field._f,
                                ...(radioOrCheckbox
                                    ? {
                                          refs: [
                                              ...refs.filter(live),
                                              fieldRef,
                                              ...(Array.isArray(get(defaultValues, name))
                                                  ? [{}]
                                                  : []),
                                          ],
                                          ref: { type: fieldRef.type, name },
                                      }
                                    : { ref: fieldRef }),
                            },
                        }),
                    );

                    updateValidAndValue(name, false, undefined, fieldRef);
                }
            },
        };
    };

    return {
        formState$,
        values$,
        get formState() {
            return formState$.get() as FormState<TFieldValues>;
        },
        get values() {
            return values$.get();
        },
        register,
        handleSubmit,
        setValue,
        getValues,
        getObservable,
        peekValues,
        setFocus,
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
            _updateDisabledField,
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
            get _fields() {
                return fields$.get();
            },
            set _fields(value) {
                fields$.set(ObservableHint.opaque(value));
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
