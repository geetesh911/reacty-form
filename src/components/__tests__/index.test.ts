import { describe, expect, it } from 'vitest';

import * as Components from '../index';

describe('hooks index', () => {
    it('should re-export Controller', () => {
        expect(Components.Controller).toBeDefined();
    });
});
