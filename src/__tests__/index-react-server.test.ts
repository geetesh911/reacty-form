import { describe, expect, it } from 'vitest';

import * as AllExports from '../index.react-server';
// Import specific modules to compare exports
import * as Logics from '../logic';
import * as Utils from '../utils';

describe('index.react-server exports', () => {
    describe('Logic exports', () => {
        it('should export all logic functions', () => {
            // Get all exports from logic
            const logicKeys = Object.keys(Logics);
            logicKeys.forEach((key) => {
                expect(AllExports).toHaveProperty(key);
                expect(AllExports[key as keyof typeof AllExports]).toBe(
                    Logics[key as keyof typeof Logics],
                );
            });
        });
    });

    describe('Utils exports', () => {
        it('should export all utility functions', () => {
            // Get all exports from utils
            const utilKeys = Object.keys(Utils);
            utilKeys.forEach((key) => {
                expect(AllExports).toHaveProperty(key);
                expect(AllExports[key as keyof typeof AllExports]).toBe(
                    Utils[key as keyof typeof Utils],
                );
            });
        });
    });

    // Test for no duplicate exports
    it('should not have duplicate exports', () => {
        const allExportedKeys = Object.keys(AllExports);
        const uniqueKeys = new Set(allExportedKeys);
        expect(allExportedKeys.length).toBe(uniqueKeys.size);
    });
});
