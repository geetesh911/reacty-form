import { FieldElement } from '../types';

export const isFileInput = (element: FieldElement): element is HTMLInputElement =>
    element.type === 'file';
