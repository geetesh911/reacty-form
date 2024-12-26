import { Ref } from '../types';

import { isHTMLElement } from './is-html-element';

export const live = (ref: Ref) => isHTMLElement(ref) && ref.isConnected;
