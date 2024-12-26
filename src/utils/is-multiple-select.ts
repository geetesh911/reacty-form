import { FieldElement } from '../types';

export const isMultipleSelect = (element: FieldElement): element is HTMLSelectElement =>
    element.type === `select-multiple`;
