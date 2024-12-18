export const isWeb =
    typeof window !== 'undefined' &&
    typeof window.HTMLElement !== 'undefined' &&
    typeof document !== 'undefined';
