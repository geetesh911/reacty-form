import type { Noop } from '../types';

export type Observer<T> = {
    next: (value: T) => void;
};

export type Subscription = {
    unsubscribe: Noop;
};

export type Subject<T> = {
    readonly observers: Observer<T>[];
    subscribe: (value: Observer<T>) => Subscription;
    unsubscribe: Noop;
} & Observer<T>;

export const createSubject = <T>(): Subject<T> => {
    let _observers: Observer<T>[] = [];

    const next = (value: T): void => {
        for (const observer of _observers) {
            observer.next?.(value);
        }
    };

    const subscribe = (observer: Observer<T>): Subscription => {
        _observers.push(observer);

        return {
            unsubscribe: (): void => {
                _observers = _observers.filter((o) => o !== observer);
            },
        };
    };

    const unsubscribe = (): void => {
        _observers = [];
    };

    return {
        get observers(): Array<Observer<T>> {
            return _observers;
        },
        next,
        subscribe,
        unsubscribe,
    };
};
