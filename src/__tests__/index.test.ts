import { describe, expect, it } from 'vitest';

// Import specific modules to compare exports
import * as Components from '../components';
import * as Constants from '../constants';
import * as Hooks from '../hooks';
import * as AllExports from '../index';
import * as Providers from '../providers';

describe('Index exports', () => {
    describe('Components exports', () => {
        it('should export all components', () => {
            // Get all exports from components
            const componentKeys = Object.keys(Components);
            componentKeys.forEach((key) => {
                expect(AllExports).toHaveProperty(key);
                expect(AllExports[key as keyof typeof AllExports]).toBe(
                    Components[key as keyof typeof Components],
                );
            });
        });
    });

    describe('Constants exports', () => {
        it('should export all constants', () => {
            // Get all exports from constants
            const constantKeys = Object.keys(Constants);
            constantKeys.forEach((key) => {
                expect(AllExports).toHaveProperty(key);
                expect(AllExports[key as keyof typeof AllExports]).toBe(
                    Constants[key as keyof typeof Constants],
                );
            });
        });
    });

    describe('Hooks exports', () => {
        it('should export all hooks', () => {
            // Get all exports from hooks
            const hookKeys = Object.keys(Hooks);
            hookKeys.forEach((key) => {
                expect(AllExports).toHaveProperty(key);
                expect(AllExports[key as keyof typeof AllExports]).toBe(
                    Hooks[key as keyof typeof Hooks],
                );
            });
        });
    });

    describe('Providers exports', () => {
        it('should export all providers', () => {
            // Get all exports from providers
            const providerKeys = Object.keys(Providers);
            providerKeys.forEach((key) => {
                expect(AllExports).toHaveProperty(key);
                expect(AllExports[key as keyof typeof AllExports]).toBe(
                    Providers[key as keyof typeof Providers],
                );
            });
        });
    });

    // Test for duplicate exports
    it('should not have duplicate exports', () => {
        const allExportedKeys = Object.keys(AllExports);
        const uniqueKeys = new Set(allExportedKeys);
        expect(allExportedKeys.length).toBe(uniqueKeys.size);
    });

    // Test against known exports from all-exports.json
    it('should match the expected exports list', () => {
        const expectedExports = [
            'Controller',
            'EVENTS',
            'FormContext',
            'FormProvider',
            'INPUT_VALIDATION_RULES',
            'VALIDATION_MODE',
            'useController',
            'useFieldArray',
            'useForm',
            'useFormContext',
            'useFormState',
            'useWatch',
        ];

        expectedExports.forEach((exportName) => {
            expect(AllExports).toHaveProperty(exportName);
        });

        // Check if we have exactly the expected number of exports
        expect(Object.keys(AllExports).sort()).toEqual(expectedExports.sort());
    });
});
