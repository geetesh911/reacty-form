import '@testing-library/jest-dom/vitest';

import React from 'react';
import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useForm } from '../../hooks/use-form.hook';
import { FormProvider } from '../form.provider';

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
});
