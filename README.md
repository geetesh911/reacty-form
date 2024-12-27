# Per-form

Per-Form is a React form management library that provides a set of hooks and components (very similar to `react-hook-form`) to manage form state efficiently. It leverages the power of [Legend-State](https://github.com/legendapp/legend-state) for state management, offering fine-grained reactivity and performance optimizations.

## **Installation**

```bash
npm install per-form
# or
yarn add per-form
# or
pnpm add per-form
```

## **Getting Started**

Here's a basic example of using Per-Form in a React application:

```tsx
import React from 'react';
import { Controller, useForm } from 'per-form';

function App() {
    const { register, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <input {...register('name')} />
            {errors.name && <p>Name is required.</p>}
            <input type="submit" />
        </form>
    );
}

export default App;
```

## API Reference

## **`useForm`**

`useForm` is a custom hook for managing forms with ease. It takes one object as an **optional** argument. The following example demonstrates all of its properties along with their default values.

**Generic props:**

| mode | Validation strategy **before** submitting behaviour. |
| --- | --- |
| reValidateMode | Validation strategy **after** submitting behaviour. |
| defaultValues | Default values for the form. |
| values | Reactive values to update the form values. |
| resetOptions | Option to reset form state update while updating new form values. |
| criteriaMode | Display all validation errors or one at a time. |
| shouldFocusError | Enable or disable built-in focus management. |
| delayError | Delay error from appearing instantly. |

**Schema validation props:**

| resolver | Integrates with your preferred schema validation library. (it accepts the resolver from @hookform/resolver) |
| --- | --- |
| context | A context object to supply for your schema validation. |

### Props:

- ### **`mode: onChange | onBlur | onSubmit | onTouched | all = 'onSubmit'`**

    This option allows you to configure the validation strategy before a user submits the form. The validation occurs during the `onSubmit` event, which is triggered by invoking the `handleSubmit` function.

    | Name | Type | Description |
    | --- | --- | --- |
    | onSubmit | string | Validation is triggered on the `submit` event, and inputs attach `onChange` event listeners to re-validate themselves. |
    | onBlur | string | Validation is triggered on the `blur` event. |
    | onChange | string | Validation is triggered on the `change`event for each input, leading to multiple re-renders. Warning: this often comes with a significant impact on performance. |
    | onTouched | string | Validation is initially triggered on the first `blur` event. After that, it is triggered on every `change` event.
    **Note:** when using with `Controller`, make sure to wire up `onBlur` with the `render` prop. |
    | all | string | Validation is triggered on both `blur` and `change` events. |

- ### **`reValidateMode: onChange | onBlur | onSubmit = 'onChange'`**

    This option allows you to configure validation strategy when inputs with errors get re-validated **after** a user submits the form (`onSubmit` event and `handleSubmit` function executed). By default, re-validation occurs during the input change event.

- ### **`defaultValues: FieldValues | Promise<FieldValues>`**

    The `defaultValues` prop populates the entire form with default values. It supports both synchronous and asynchronous assignment of default values. While you can set an input's default value using `defaultValue` or `defaultChecked` [(as detailed in the official React documentation)](https://reactjs.org/docs/uncontrolled-components.html), it is **recommended** to use `defaultValues` for the entire form.

    ```jsx
    // set default value sync
    useForm({
        defaultValues: {
            firstName: '',
            lastName: ''
        }
    })

    // set default value async
    useForm({
        defaultValues: async () => fetch('/api-endpoint');
    })
    ```

    ### **Rules**

    - You **should avoid** providing `undefined` as a default value, as it conflicts with the default state of a controlled component.
    - `defaultValues` are cached. To reset them, use the reset API.
    - `defaultValues` will be included in the submission result by default.
    - It's recommended to avoid using custom objects containing prototype methods, such as `Moment` or `Luxon`, as `defaultValues`.
    - There are other options for including form data:
        
        ```jsx
        // include hidden input
        <input {...register("hidden")} type="hidden" />
        register("hidden", { value: "data" })
        
        // include data onSubmit
        const onSubmit = (data) => {
            const output = {
                ...data,
                others: "others"
            }
        }
        ```
        

- ### **`values: FieldValues`**

    The `values` props will react to changes and update the form values, which is useful when your form needs to be updated by external state or server data.

    ```jsx
    // set default value sync
    function App({ values }) {
        useForm({
            values  // will get updated when values props updates       
        })
    }

    function App() {
        const values = useFetch('/api');
        
        useForm({
            defaultValues: {
                firstName: '',
                lastName: '',
            },
            values, // will get updated once values returns
        })
    }
    ```

- ### **`resetOptions: KeepStateOptions`**

    This property is related to value update behaviors. When `values` or `defaultValues` are updated, the `reset` API is invoked internally. It's important to specify the desired behavior after `values` or `defaultValues` are asynchronously updated. The configuration option itself is a reference to the reset method's options.

    ```jsx
    // by default asynchronously value or defaultValues update will reset the form values
    useForm({ values })
    useForm({ defaultValues: async () => await fetch() })

    // options to config the behaviour
    // eg: I want to keep user interacted/dirty value and not remove any user errors
    useForm({
        values,
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    })
    ```

- ### **`criteriaMode: firstError | all`**

    | • When set to `firstError` (default), only the first error from each field will be gathered.
    • When set to `all`, all errors from each field will be gathered. | --- |
    | --- | --- |

- ### **`shouldFocusError: boolean = true`**

    When set to `true` (default), and the user submits a form that fails validation, focus is set on the first field with an error.

    Note: only registered fields with a `ref` will work. Custom registered inputs do not apply. For example: `register('test') // doesn't work`

    Note: the focus order is based on the `register` order.

    ---

- ### **`delayError: number`**

    This configuration delays the display of error states to the end-user by a specified number of milliseconds. If the user corrects the error input, the error is removed instantly, and the delay is not applied.

- ### **`resolver: Resolver`**

    This function allows you to use any external validation library such as [Yup](https://github.com/jquense/yup), [Zod](https://github.com/vriad/zod), [Joi](https://github.com/hapijs/joi), [Vest](https://github.com/ealush/vest), [Ajv](https://github.com/ajv-validator/ajv) and many others. The goal is to make sure you can seamlessly integrate whichever validation library you prefer. If you're not using a library, you can always write your own logic to validate your forms.

    ```
    npm install @hookform/resolvers
    ```


    ### **Props**

    | Name | Type | Description |
    | --- | --- | --- |
    | `values` | `object` | This object contains the entire form values. |
    | `context` | `object` | This is the `context` object which you can provide to the `useForm` config. It is a mutable `object` that can be changed on each re-render. |
    | `options` | `{   criteriaMode: string, fields: object, names: string[] }` | This is the option object containing information about the validated fields, names and `criteriaMode` from `useForm`. |

    ### **Rules**

    - Schema validation focuses on field-level error reporting. Parent-level error checking is limited to the direct parent level, which is applicable for components such as group checkboxes.
    - This function will be cached.
    - Re-validation of an input will only occur one field at time during a user’s interaction. The lib itself will evaluate the `error` object to trigger a re-render accordingly.
    - A resolver can not be used with the built-in validators (e.g.: required, min, etc.)
    - When building a custom resolver:
        - Make sure that you return an object with both `values` and `errors` properties. Their default values should be an empty object. For example: `{}`.
        - The keys of the `error` object should match the `name` values of your fields.

    ### **Examples**

    ```jsx
    import React from 'react';
    import { useForm } from 'per-form';
    import { yupResolver } from '@hookform/resolvers/yup';
    import * as yup from "yup";

    const schema = yup.object().shape({
        name: yup.string().required(),
        age: yup.number().required(),
    }).required();

    const App = () => {
        const { register, handleSubmit } = useForm({
            resolver: yupResolver(schema),
        });

        return (
            <form onSubmit={handleSubmit(d => console.log(d))}>
            <input {...register("name")} />
            <input type="number" {...register("age")} />
            <input type="submit" />
            </form>
        );
    };
    ```


### Return

The following list contains reference to useForm return props.

- register
- formState
- handleSubmit
- reset
- resetField
- setError
- clearErrors
- setValue
- setFocus
- getValues
- getFieldState
- trigger
- control

## **`useController`**

This custom hook powers the `Controller`. It's useful for creating reusable Controlled input.

### **Props**

The following table contains information about the arguments for `useController`.

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `FieldPath` | ✓ | Unique name of your input. |
| `form` | `UseFormReturn` | Required if you haven’t wrapped your form in `FormProvider`  | `form` object is the value calling `useForm` returns. Optional when using `FormProvider`. |
| `defaultValue` | `unknown` |  | **Important:** Can not apply `undefined` to `defaultValue` or `defaultValues` at `useForm`. <br>• You need to either set `defaultValue` at the field-level or `useForm`'s `defaultValues`. `undefined` is not a valid value. <br> • If your form will invoke `reset` with default values, you will need to provide `useForm` with `defaultValues`. |
| `setValueAs` | `(value: any) => FieldPathValue<TFieldValues, TName>;` |  | Return input value by running through the function. Useful in cases like when you want to convert the number input value to number from string. |

The following table contains information about properties which `useController` produces.

| Object Name | Name | Type | Description |
| --- | --- | --- | --- |
| `field` | `onChange` | `(value: any) => void` | A function which sends the input's value to the library. <br><br>It should be assigned to the `onChange` prop of the input and value should **not be `undefined`**. <br><br>This prop update formState and you should avoid manually invoke setValue or other API related to field update. |
| `field` | `onBlur` | `() => void` | A function which sends the input's onBlur event to the library. It should be assigned to the input's `onBlur` prop. |
| `field` | `value` | `unknown` | The current value of the controlled component. |
| `field` | `name` | `string` | Input's name being registered. |
| `field` | `disabled` | `boolean` | Whether the form is disabled or the field is disabled. |
| `field` | `ref` |  | A ref used to connect hook form to the input. Assign `ref` to component's input ref to allow hook form to focus the error input. |
| `fieldState` | `invalid` | `boolean` | Invalid state for current input. |
| `fieldState` | `isTouched` | `boolean` | Touched state for current controlled input. |
| `fieldState` | `isDirty` | `boolean` | Dirty state for current controlled input. |
| `fieldState` | `error` | `object` | error for this specific input. |
| `formState` | `isDirty` | `boolean` | Set to `true` after the user modifies any of the inputs.<br><br>• **Important:** Make sure to provide all inputs' defaultValues at the useForm, so hook form can have a single source of truth to compare whether the form is dirty.<br><br>`const {  formState: { isDirty, dirtyFields }, setValue } = useForm({ defaultValues: { test: "" } }); // isDirty: truesetValue('test', 'change')// isDirty: false because there getValues() === defaultValuessetValue('test', '')` <br><br> • File typed input will need to be managed at the app level due to the ability to cancel file selection and [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) object. |
| `formState` | `dirtyFields` | `object` | An object with the user-modified fields. Make sure to provide all inputs' defaultValues via useForm, so the library can compare against the `defaultValues`. <br><br>• **Important:** Make sure to provide defaultValues at the useForm, so hook form can have a single source of truth to compare each field's dirtiness.<br><br>• Dirty fields will **not** represent as `isDirty` formState, because dirty fields are marked field dirty at field level rather the entire form. If you want to determine the entire form state use `isDirty` instead. |
| `formState` | `touchedFields` | `object` | An object containing all the inputs the user has interacted with. |
| `formState` | `defaultValues` | `object` | The value which has been set at useForm's defaultValues or updated defaultValues via reset API. |
| `formState` | `isSubmitted` | `boolean` | Set to `true` after the form is submitted. Will remain `true` until the `reset` method is invoked. |
| `formState` | `isSubmitSuccessful` | `boolean` | Indicate the form was successfully submitted without any runtime error. |
| `formState` | `isSubmitting` | `boolean` | `true` if the form is currently being submitted. `false` otherwise. |
| `formState` | `isLoading` | `boolean` | `true` if the form is currently loading async default values.<br><br> **Important:** this prop is only applicable to async `defaultValues` <br><br>`const { formState: { isLoading } } = useForm({ defaultValues: async () =>  fetch('/api') });` |
| `formState` | `submitCount` | `number` | Number of times the form was submitted. |
| `formState` | `isValid` | `boolean` | Set to `true` if the form doesn't have any errors.<br><br>`setError` has no effect on `isValid` formState, `isValid` will always derived via the entire form validation result. |
| `formState` | `isValidating` | `boolean` | Set to `true` during validation. |
| `formState` | `errors` | `object` | An object with field errors. There is also an ErrorMessage component to retrieve error message easily. |

### Example

```jsx
import { TextField } from "@material-ui/core";
import { useController, useForm } from "per-form";

function Input({ form, name }) {
  const {
    field,
    fieldState: { invalid, isTouched, isDirty },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    form,
    rules: { required: true },
  });

  return (
    <TextField 
      onChange={field.onChange} // send value to hook form 
      onBlur={field.onBlur} // notify when input is touched/blur
      value={field.value} // input value
      name={field.name} // send down the input name
      inputRef={field.ref} // send input ref, so we can focus on input when error appear
    />
  );
}
```

### **Tips**

- It's important to be aware of each prop's responsibility when working with external controlled components, such as MUI, AntD, Chakra UI. Its job is to spy on the input, report, and set its value.
    - **onChange**: send data back to hook form
    - **onBlur**: report input has been interacted (focus and blur)
    - **value**: set up input initial and updated value
    - **ref**: allow input to be focused with error
    - **name**: give input an unique name
    
    It's fine to host your state and combined with `useController`.
    
    ```jsx
    const { field } = useController();
    const [value, setValue] = useState(field.value);
    
    onChange={(event) => {
      field.onChange(parseInt(event.target.value)) // data send back to hook form
      setValue(event.target.value) // UI state
    }}
    ```
    
- Do not `register` input again. This custom hook is designed to take care of the registration process.
    
    ```jsx
    const { field } = useController({ name: 'test' })
    
    <input {...field} /> // ✅
    <input {...field} {...register('test')} /> // ❌ double up the registration
    ```
    
- It's ideal to use a single `useController` per component. If you need to use more than one, make sure you rename the prop. May want to consider using `Controller` instead.
    
    ```jsx
    const { field: input } = useController({ name: 'test' })
    const { field: checkbox } = useController({ name: 'test1' })
    
    <input {...input} />
    <input {...checkbox} />
    ```
    

## **`Controller`**

Per-Form embraces uncontrolled components and native inputs, however it's hard to avoid working with external controlled component such as [React-Select](https://github.com/JedWatson/react-select), [AntD](https://github.com/ant-design/ant-design) and [MUI](https://mui.com/). This wrapper component will make it easier for you to work with them.

### Props

---

The following table contains information about the arguments for `Controller`.

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `FieldPath` | ✓ | Unique name of your input. |
| `form` | `UseFormReturn` |  | `form` object is the value calling `useForm` returns. Optional when using `FormProvider`. |
| `render` | `Function` |  | This is a render prop. A function that returns a React element and provides the ability to attach events and value into the component. This simplifies integrating with external controlled components with non-standard prop names. Provides `onChange`, `onBlur`, `name`, `ref` and `value` to the child component, and also a `fieldState` object which contains specific input state. |
| `component`  | `React.FC` |  | If you don’t have any customizations required you can directly pass the component in this prop instead of using render method. |
| `componentProps` | `object`  |  | This object contain the props that you want to pass in the component you passed in component prop |
| `defaultValue` | `unknown` |  | **Important:** Can not apply `undefined` to `defaultValue` or `defaultValues` at `useForm`.<br><br>• You need to either set `defaultValue` at the field-level or `useForm`'s `defaultValues`. `undefined` is not a valid value.<br>• If your form will invoke `reset` with default values, you will need to provide `useForm` with `defaultValues`.<br>• Calling `onChange` with `undefined` is not valid. You should use `null` or the empty string as your default/cleared value instead. |
| `disabled` | `boolean = false` |  | `disabled` prop will be returned from `field` prop. Controlled input will be disabled and its value will be omitted from the submission data. |

### Example

```jsx
import ReactDatePicker from "react-datepicker"
import { TextField } from "@material-ui/core"
import { useForm, Controller } from "per-form"

type FormValues = {
  ReactDatepicker: string
}

function App() {
  const form = useForm<FormValues>()

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <Controller
        form={form}
        name="ReactDatepicker"
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <ReactDatePicker
            onChange={onChange} // send value to hook form
            onBlur={onBlur} // notify when input is touched/blur
            selected={value}
          />
        )}
      />

      <input type="submit" />
    </form>
  )
}
```

## **`useFormContext`**

This custom hook allows you to access the form context. `useFormContext` is intended to be used in deeply nested structures, where it would become inconvenient to pass the context as a prop.

### Return

---

This hook will return all the useForm return methods and props.

```jsx
const methods = useForm()

<FormProvider {...methods} /> // all the useForm return props

const methods = useFormContext() // retrieve those props
```

**RULES**

You need to wrap your form with the `FormProvider` component for `useFormContext` to work properly.

### Example

```tsx
import React from "react"
import { useForm, FormProvider, useFormContext } from "per-form"

export default function App() {
  const form = useForm()
  const onSubmit = (data) => console.log(data)
  const { register, reset } = form

  useEffect(() => {
    reset({
      name: "data",
    })
  }, [reset]) // ❌ never put `methods` as the deps

  return (
    <FormProvider form={form}>
      {/* pass all methods into the context */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <NestedInput />
        <input {...register("name")} />
        <input type="submit" />
      </form>
    </FormProvider>
  )
}

function NestedInput() {
  const { register } = useFormContext() // retrieve all hook methods
  return <input {...register("test")} />
}
```

## **`FormProvider`**

This component will host context object and allow consuming component to subscribe to context and use useForm props and methods.

### Props

---

This following table applied to `FormProvider`, `useFormContext` accepts no argument.

| Name | Type | Description |
| --- | --- | --- |
| form | UseFormReturn | `FormProvider` requires all `useForm` methods. Just pass the whole form object that `useForm` returns |

### Example

```tsx
import React from "react"

import { useForm, FormProvider, useFormContext } from "per-form"

export default function App() {
  const form = useForm()

  const onSubmit = (data) => console.log(data)
  const { register, reset } = form

  useEffect(() => {
    reset({
      name: "data",
    })
  }, [reset]) // ❌ never put `methods` as the deps

  return (
    <FormProvider form={form}>
      {/* pass all methods into the context */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <NestedInput />
        <input {...register("name")} />
        <input type="submit" />
      </form>
    </FormProvider>
  )
}

function NestedInput() {
  const { register } = useFormContext() // retrieve all hook methods

  return <input {...register("test")} />
}
```

## **`useWatch`**

It allows you to subscribe to any changes that happen in a particular form field.

### Props (the first parameter of the useWatch hook)

---

| Name | Type | Description |
| --- | --- | --- |
| form | UseFormReturn | `form` object provided by `useForm`. It's optional if you are using `FormProvider`. |
| name | string | The name of the form field |

### Callback (the second parameter of the useWatch hook)

`callback: (e: ObserveEventCallback<TFieldValues>) => void`

- This callback is where you write the logic for handling changes to the form field's value. 
- `ObserveEventCallback` comes from legend-state. This hook internally uses `useObserve` hook of legend state to subscribe for state changes.

## **`useFormState`**

This custom hook returns the current state of the form.

### Props

| Name | Type | Description |
| --- | --- | --- |
| form | UseFormReturn | `form` object provided by `useForm`. It's optional if you are using `FormProvider`. |

### Return

| Name | Type | Description |
| --- | --- | --- |
| `isDirty` | `boolean` | Set to true after the user modifies any of the inputs. <br><br> **Important**: Make sure to provide all inputs' defaultValues at the useForm, so hook form can have a single source of truth to compare whether the form is dirty.<br><br> `const {  formState: { isDirty, dirtyFields },  setValue,} = useForm({ defaultValues: { test: \"\" } }); isDirty: truesetValue('test', 'change')  isDirty: false because there getValues() === defaultValuessetValue('test', '')` <br><br> File typed input will need to be managed at the app level due to the ability to cancel file selection and FileList object. |
| `dirtyFields` | `object` | An object with the user-modified fields. Make sure to provide all inputs' defaultValues via useForm, so the library can compare against the `defaultValues`. <br><br> **Important:** Make sure to provide defaultValues at the useForm, so hook form can have a single source of truth to compare each field's dirtiness.<br><br> Dirty fields will **not** represent as `isDirty` formState, because dirty fields are marked field dirty at field level rather the entire form. If you want to determine the entire form state use `isDirty` instead. |
| `touchedFields` | `object` | An object containing all the inputs the user has interacted with. |
| `defaultValues` | `object` | The value which has been set at useForm's defaultValues or updated defaultValues via reset API. |
| `isSubmitted` | `boolean` | Set to `true` after the form is submitted. Will remain `true` until the `reset` method is invoked. |
| `isSubmitSuccessful` | `boolean` | Indicate the form was successfully submitted without any runtime error. |
| `isSubmitting` | `boolean` | `true` if the form is currently being submitted. `false` otherwise. |
| `isLoading` | `boolean` | `true` if the form is currently loading async default values. <br><br> **Important:** this prop is only applicable to async `defaultValues` <br><br> `const {   formState: { isLoading } } = useForm({   defaultValues: async () => await fetch('/api') });` |
| `submitCount` | `number` | Number of times the form was submitted. |
| `isValid` | `boolean` | Set to `true` if the form doesn't have any errors. <br><br>`setError` has no effect on `isValid` formState, `isValid` will always derived via the entire form validation result. |
| `isValidating` | `boolean` | Set to `true` during validation. |
| `validatingFields` | `boolean` | Capture fields which are getting async validation. |
| `errors` | `object` | An object with field errors. There is also an ErrorMessage component to retrieve error message easily. |
| `disabled` | `boolean` | Set to `true` if the form is disabled via the `disabled` prop in useForm. |

### Example

```tsx
import * as React from "react";
import { useForm, useFormState } from "per-form";

function Child({ form }) {
  const { dirtyFields } = useFormState({
    form
  });

  return dirtyFields.firstName ? <p>Field is dirty.</p> : null;
};

export default function App() {
  const form = useForm({
    defaultValues: {
      firstName: "firstName"
    }
  });
  const { register, handleSubmit } = form;
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      <Child form={form} />

      <input type="submit" />
    </form>
  );
}
```

## **`useFieldArray`**

Custom hook for working with Field Arrays (dynamic form). The motivation is to provide better user experience and performance.

### Props

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ✓ | Name of the field array. **Note:** Do not support dynamic name. |
| `form`  | `UseFormReturn` |  | `form` object is the value calling `useForm` returns. Optional when using `FormProvider`. |

### Example

```tsx
function FieldArray() {
  const form = useForm();
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    form, // form props comes from useForm (optional: if you are using FormProvider)
    name: "test", // unique name for your Field Array
  });

  return (
    {fields.map((field, index) => (
      <input
        key={index}
        {...form.register(`test.${index}.value`)} 
      />
    ))}
  );
}
```

### **Return**

| Name | Type | Description |
| --- | --- | --- |
| `fields` | `object & { id: string }` | This `object` contains the `defaultValue` and `key` for your component. |
| `append` | `(obj: object \| object[], focusOptions) => void` | Append input/inputs to the end of your fields and focus. The input value will be registered during this action.<br><br>**Important:** append data is required and not partial. |
| `prepend` | `(obj: object \| object[], focusOptions) => void` | Prepend input/inputs to the start of your fields and focus. The input value will be registered during this action.<br><br>**Important:** prepend data is required and not partial. |
| `insert` | `(index: number, value: object \| object[], focusOptions) => void` | Insert input/inputs at particular position and focus.<br><br>**Important:** insert data is required and not partial. |
| `swap` | `(from: number, to: number) => void` | Swap input/inputs position. |
| `move` | `(from: number, to: number) => void` | Move input/inputs to another position. |
| `update` | `(index: number, obj: object) => void` | Update input/inputs at a particular position, updated fields will get unmounted and remounted. If this is not desired behavior, please use `setValue` API instead.<br><br>**Important:** update data is required and not partial. |
| `replace` | `(obj: object[]) => void` | Replace the entire field array values. |
| `remove` | `(index?: number \| number[]) => void` | Remove input/inputs at particular position, or remove all when no index provided. |

# Mentions

- I want to mention `legend state` for such a beautiful library which handles state management beautifully
- I also want to mention `react-hook-form` from which I took so much inspiration while building this library.

# Support

If you enjoy using this project or want to help improve it, your support means the world! You can:

- ⭐ Star the repository
- 🗨️ Share feedback
- <a href="https://www.buymeacoffee.com/geetesh911" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 30px !important;width: 108px !important;" ></a>

# License

This project is licensed under the MIT License.