import { describe, expect, it } from 'vitest';

import * as Functions from '../index';

describe('hooks index', () => {
    it('should re-export getEventValue', () => {
        expect(Functions.getEventValue).toBeDefined();
    });
});
