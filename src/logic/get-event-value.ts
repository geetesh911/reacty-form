import { isCheckBoxInput, isObject } from '../utils';

type Event = { target: { checked: boolean; value: string; name: string } };

export const getEventValue = (event: unknown): unknown =>
    isObject(event) && (event as Event).target
        ? isCheckBoxInput((event as Event).target)
            ? (event as Event).target.checked
            : (event as Event).target.value
        : event;
