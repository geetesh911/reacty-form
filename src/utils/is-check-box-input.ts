import type { FieldElement } from '../types';

export const isCheckBoxInput = (element: FieldElement): element is HTMLInputElement =>
    element.type === 'checkbox';
