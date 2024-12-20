# Per-Form

Per-Form is a React form management library that provides a set of hooks and components to manage form state efficiently. It leverages the power of [Legend-State](https://github.com/legendapp/legend-state) for state management, offering fine-grained reactivity and performance optimizations.

## Installation

```bash
npm install per-form
# or
yarn add per-form
# or
pnpm add per-form
```

## Features

- **Flexible Form Management**: Easily handle form state, validation, and submission.
- **Custom Hooks**: Utilize a collection of hooks like `useForm`, `useController`, `useFieldArray`, `useFormContext`, and `useFormState` to build complex forms.
- **Performance Optimized**: Minimizes re-renders and improves performance by leveraging observables.

## Getting Started

Here's a basic example of using Per-Form in a React application:

```tsx
import React from 'react';
import { useForm, Controller } from 'per-form';

function App() {
    const form = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                name="firstName"
                form={form}
                render={({ onChange, onBlur, value }) => (
                    <input name="firstName" onChange={onChange} onBlur={onBlur} value={value} />
                )}
            />
            <Controller name="lastName" form={form} component={input} />
            <input type="submit" />
        </form>
    );
}

export default App;
```

## API Reference

### `useForm`

useForm is a custom hook for managing forms with ease. It takes one object as an optional argument. The following example demonstrates all of its properties along with their default values.

#### Usage

```tsx
import { useForm } from 'per-form';

const form = useForm(options);
```

#### Example

```tsx
const form = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
        firstName: '',
        lastName: '',
    },
    values: {},
    resetOptions: {},
    resolver: async (values) => {
        const errors = {};
        if (!values.firstName) {
            errors.firstName = 'First name is required';
        }
        return { values, errors };
    },
    context: {},
});
```

### Options

`useForm` accepts an optional configuration object to customize its behavior.

### Configuration Options

- **defaultValues**: `Object`

    - Set default values for the form.

    ```javascript
    const { register } = useForm({ defaultValues: { firstName: 'John' } });
    ```

- **mode**: `"onSubmit" | "onBlur" | "onChange" | "onTouched" | "all"`

    - Determines when validation is triggered.
    - Default: `"onSubmit"`.

- **reValidateMode**: `"onBlur" | "onChange" | "onSubmit"`

    - Determines when inputs are revalidated after validation fails.
    - Default: `"onChange"`.

- **resolver**: `(values, context) => {}`

    - Custom validation resolver (e.g., Zod, Yup).

- **criteriaMode**: `"firstError" | "all"`

    - Specifies how validation errors are aggregated.
    - Default: `"firstError"`.

- **resetOptions**: `"firstError" | "all"`

    - This property is related to value update behaviors. When values or defaultValues are updated, the reset API is invoked internally. It's important to specify the desired behavior after values or defaultValues are asynchronously updated. The configuration option itself is a reference to the reset method's options.

    ```
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

### Returned Values

### Methods

- **handleSubmit**: `(onSubmit, onError?) => (e?) => void`

    - Handles form submission.

    ```javascript
    const onSubmit = (data) => console.log(data);
    <form onSubmit={handleSubmit(onSubmit)}></form>;
    ```

- **setValue**: `(name: string, value: any, config?: Object) => void`

    - Dynamically set input value.

- **getValues**: `(name?: string | string[]) => any`

    - Retrieve form values.

- **reset**: `(values?: Object, config?: Object) => void`
    - Reset form values.

### State

- **watch**: `(name?: string | string[], defaultValue?: any) => any`

    - Watch input value changes.

- **formState**:

    - Contains properties like `isDirty`, `isValid`, `errors`, etc.

- **control**: `Object`
    - Controls form inputs (useful for custom components).

## Example

```javascript
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
    const {
        handleSubmit,
        formState: { errors },
    } = useForm();
    const {
        field,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('firstName', { required: 'First Name is required' })} />
            {errors.firstName && <p>{errors.firstName.message}</p>}

            <input type="submit" />
        </form>
    );
}

export default App;
```

Note: when using with Controller, make sure to wire up onBlur with the render prop.

all string Validation is triggered on both blur and change events.

### `useController`

Control individual form fields with fine-grained reactivity.

#### Usage

```tsx
import { useController } from 'per-form';

const {
    field: { onChange, onBlur, value, name },
    fieldState,
    formState,
} = useController({
    name: 'firstName',
    form,
});
```

### `Controller` Component

A component wrapper around `useController` for easier integration with UI components.

#### Usage

```tsx
import { Controller } from 'per-form';

<Controller name="firstName" form={form} component={input} componentProps={{ className: 'p-4' }} />;
```

or if you want more control you can use `render` prop instead of `component`

```tsx
import { Controller } from 'per-form';

<Controller
    name="firstName"
    form={form}
    render={({ onChange, onBlur, value }) => (
        <input name="firstName" onChange={onChange} onBlur={onBlur} value={value || ''} />
    )}
/>;
```

### `useFormContext`

Access the form instance in nested components without prop drilling.

#### Usage

```tsx
import { useFormContext } from 'per-form';

function NestedComponent() {
    const form = useFormContext();
    // Use form methods
}
```

### `useFormState`

Subscribe to form state and isolate re-renders at the hook level.

#### Usage

```tsx
import { useFormState } from 'per-form';

const { isDirty, errors } = useFormState({
    form,
});
```

### `useFieldArray`

Manage dynamic fields or arrays in your form.

#### Usage

```tsx
import { useFieldArray } from 'per-form';

const { append, remove, insert, fields } = useFieldArray({
    name: 'friends',
    form,
});

fields.map((field, index) => (
    <input key={index} name={`friends.${index}.name`} onChange={/* ... */} value={/* ... */} />
));
```

## Note

- This repository is in active development and we are trying are best to support more and more features and make this library more and more stable.

## Support

If you enjoy using this project or want to help improve it, your support means the world! You can:

- ⭐ Star the repository
- 🗨️ Share feedback

- <a href="https://www.buymeacoffee.com/geetesh911" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 30px !important;width: 108px !important;" ></a>

## License

This project is licensed under the MIT License.
