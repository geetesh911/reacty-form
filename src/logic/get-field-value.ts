import { Field } from '../types';
import {
    isCheckBoxInput,
    isFileInput,
    isMultipleSelect,
    isRadioInput,
    isUndefined,
} from '../utils';

import { getCheckboxValue } from './get-checkbox-value';
import { getFieldValueAs } from './get-field-value-as';
import { getRadioValue } from './get-radio-value';

export function getFieldValue(_f: Field['_f']) {
    const ref = _f.ref;

    if (_f.refs ? _f.refs.every((ref) => ref.disabled) : ref.disabled) {
        return;
    }

    if (isFileInput(ref)) {
        return ref.files;
    }

    if (isRadioInput(ref)) {
        return getRadioValue(_f.refs).value;
    }

    if (isMultipleSelect(ref)) {
        return [...ref.selectedOptions].map(({ value }) => value);
    }

    if (isCheckBoxInput(ref)) {
        return getCheckboxValue(_f.refs).value;
    }

    return getFieldValueAs(isUndefined(ref.value) ? _f.ref.value : ref.value, _f);
}
