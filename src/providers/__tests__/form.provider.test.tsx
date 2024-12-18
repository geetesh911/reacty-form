import '@testing-library/jest-dom/vitest';

import React from 'react';
import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useForm } from '../../hooks/use-form.hook';
import { FormProvider, useFormContext } from '../form.provider';

describe('FormProvider', () => {
    beforeEach(() => {
        cleanup();
    });

    it('should render children correctly', () => {
        const ChildComponent = () => <div data-testid="child">Child Component</div>;
        const form = renderHook(() => useForm()).result.current;

        render(
            <FormProvider form={form}>
                <ChildComponent />
            </FormProvider>,
        );

        expect(screen.getByTestId('child')).toHaveTextContent('Child Component');
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

    it('should throw an error when useFormContext is used outside FormProvider', () => {
        const ChildComponent = () => {
            try {
                useFormContext();
                return <div>Should not render this</div>;
            } catch (error) {
                return <div data-testid="error">{(error as Error).message}</div>;
            }
        };

        render(<ChildComponent />);

        expect(screen.getByTestId('error')).toHaveTextContent(
            'useFormContext must be used within a FormProvider',
        );
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

    it('should handle null form value correctly', () => {
        const ChildComponent = () => {
            try {
                useFormContext();
                return <div>Should not render this</div>;
            } catch (error) {
                return <div data-testid="error">{(error as Error).message}</div>;
            }
        };

        const form = null;

        render(
            <FormProvider form={form as any}>
                <ChildComponent />
            </FormProvider>,
        );

        expect(screen.getByTestId('error')).toHaveTextContent(
            'useFormContext must be used within a FormProvider',
        );
    });
});
