import { FieldElement } from '../types';

export const isRadioInput = (element: FieldElement): element is HTMLInputElement =>
    element.type === 'radio';
