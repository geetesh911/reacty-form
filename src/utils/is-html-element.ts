import { isWeb } from './is-web';

export const isHTMLElement = (value: unknown): value is HTMLElement => {
    if (!isWeb) {
        return false;
    }

    const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0;

    return (
        value instanceof (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement)
    );
};
