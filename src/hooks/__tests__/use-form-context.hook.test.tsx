import '@testing-library/jest-dom/vitest';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { FormProvider } from '../../providers/form.provider';
import { useController } from '../use-controller.hook';
import { useForm } from '../use-form.hook';
import { useFormContext } from '../use-form-context.hook';
import { useFormState } from '../use-form-state.hook';
import { useWatch } from '../use-watch.hook';

describe('useFormContext', () => {
    beforeEach(() => {
        cleanup();
    });

    it('should provide form context to children', () => {
        const ChildComponent = () => {
            const context = useFormContext();

            return <div data-testid="context">{context ? 'Context Available' : 'No Context'}</div>;
        };

        const form = renderHook(() => useForm()).result.current;

        render(
            <FormProvider form={form}>
                <ChildComponent />
            </FormProvider>,
        );

        expect(screen.getByTestId('context')).toHaveTextContent('Context Available');
    });

    it('should provide the correct form value in context', () => {
        const ChildComponent = () => {
            const context = useFormContext();

            return <div data-testid="form-value">{context ? 'Has Form' : 'No Form'}</div>;
        };

        const form = renderHook(() => useForm()).result.current;

        render(
            <FormProvider form={form}>
                <ChildComponent />
            </FormProvider>,
        );

        expect(screen.getByTestId('form-value')).toHaveTextContent('Has Form');
    });

    // TODO: update after implementing ref
    it('should work correctly with Controller, useWatch, useFormState.', () => {
        const App = () => {
            const { field } = useController({
                name: 'test',
            });
            return <input {...field} />;
        };

        const TestWatch = () => {
            useWatch({ name: 'test' }, () => {});

            return <p></p>;
        };

        const TestFormState = () => {
            const { isDirty } = useFormState();

            return <div>{isDirty ? 'yes' : 'no'}</div>;
        };

        const TestUseFormContext = () => {
            const formContext = useFormContext();

            formContext?.setValue('test', '');

            return null;
        };

        const Component = () => {
            const form = useForm();

            return (
                <FormProvider form={form}>
                    <App />
                    <TestUseFormContext />
                    <TestWatch />
                    <TestFormState />
                </FormProvider>
            );
        };

        const output = renderToString(<Component />);

        expect(output).toEqual('<input name="test"/><p></p><div>yes</div>');
    });
});
