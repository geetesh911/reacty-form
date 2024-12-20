import { observable } from '@legendapp/state';
import { describe, expect, it } from 'vitest';

import { setObservable } from '../set-observable';

describe('set observable', () => {
    it('should set the correct values', () => {
        const test1 = observable({ a: [{ b: { c: 3 } }] });
        expect(setObservable(test1, 'a[0].b.c', 4)?.get()).toEqual(4);
        expect(test1.a[0].b.c?.get()).toEqual(4);

        const test2: any = observable({ foo: { bar: 'baz' } });
        expect(setObservable(test2, 'foo.arr[0]', 3)?.get()).toEqual(3);
        expect(test2.foo.arr[0].get()).toEqual(3);

        const test3: any = observable({ foo: { bar: 'baz' } });
        expect(setObservable(test3, 'foo.arr["1"]', true)?.get()).toEqual(true);
        expect(test3.foo.arr[1].get()).toEqual(true);

        const test4: any = observable({ foo: { bar: 'baz' } });
        expect(setObservable(test4, 'foo.obj.key', 'test')?.get()).toEqual('test');
        expect(test4.foo.obj.key.get()).toEqual('test');

        const test5: any = observable({ foo: 1 });
        expect(setObservable(test5, 'foo.obj.key', 3)?.get()).toEqual(3);
        expect(test5.foo.obj.key.get()).toEqual(3);

        const test6: any = observable({});
        expect(setObservable(test6, 'foo.arr[0].obj.key', 1)?.get()).toEqual(1);
        expect(test6.foo.arr[0].obj.key.get()).toEqual(1);
    });

    it('should not populate prototype', () => {
        const test = observable({});
        setObservable(test, '__proto__[test2]', '456')?.get();
        expect(Object.prototype).toEqual({});
    });
});
