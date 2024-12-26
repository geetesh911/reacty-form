import { FieldElement } from '../types';

import { isCheckBoxInput } from './is-check-box-input';
import { isRadioInput } from './is-radio-input';

export const isRadioOrCheckbox = (ref: FieldElement): ref is HTMLInputElement =>
    isRadioInput(ref) || isCheckBoxInput(ref);
