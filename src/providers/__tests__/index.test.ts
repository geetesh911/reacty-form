import { describe, expect, it } from 'vitest';

import * as Providers from '../index';

describe('hooks index', () => {
    it('should re-export FormProvider', () => {
        expect(Providers.FormProvider).toBeDefined();
    });

    it('should re-export FormContext', () => {
        expect(Providers.FormContext).toBeDefined();
    });
});
