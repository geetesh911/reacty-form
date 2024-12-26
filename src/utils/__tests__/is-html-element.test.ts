import { beforeEach, describe, expect, it, vi } from 'vitest';

// mock the is-web module
import { isHTMLElement } from '../../utils/is-html-element';

describe('isHTMLElement', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return true when value is HTMLElement', () => {
        expect(isHTMLElement(document.createElement('input'))).toBeTruthy();
    });

    it('should return true when HTMLElement is inside an iframe', () => {
        const iframe = document.createElement('iframe');
        document.body.append(iframe);

        const iframeDocument = iframe.contentDocument!;
        const input = iframeDocument.createElement('input');
        iframeDocument.body.append(input);
        expect(isHTMLElement(input)).toBeTruthy();
    });

    it('should return false when not in web environment', async () => {
        vi.doMock('../../utils/is-web', () => ({
            isWeb: false,
        }));

        const { isHTMLElement } = await import('../../utils/is-html-element');

        const element = document.createElement('div');
        expect(isHTMLElement(element)).toBeFalsy();

        vi.resetModules();
    });
});
