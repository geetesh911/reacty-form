import { Observable, observable } from '@legendapp/state';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { unsetObservable } from '../../utils/unset-observable';

describe('unset', () => {
    it('should unset the array', () => {
        const test$ = observable(['test', 'test1', 'test2']);
        expect(unsetObservable(test$, '[0]').get()).toEqual([undefined, 'test1', 'test2']);
        expect(unsetObservable(test$, '[1]').get()).toEqual([undefined, undefined, 'test2']);
        expect(unsetObservable(test$, '[2]').get()).toEqual([undefined, undefined, undefined]);
    });

    it('should return original object when path is not defined', () => {
        const test = observable({
            test: 'test',
        });

        expect(unsetObservable(test, '')?.get()).toEqual(test.get());
    });

    it('should unset the flat object', () => {
        const test = observable({
            test: 'test',
        });

        expect(unsetObservable(test, 'test').get()).toEqual({});
    });

    it('should not unset if specified field is undefined', () => {
        const test = observable({
            test: {
                test1: 'test',
            },
        });

        expect(unsetObservable(test, 'testDummy.test1').get()).toEqual({ test: { test1: 'test' } });
    });

    it('should unset the nest object', () => {
        const test = observable({
            test: {
                min: 'test',
            },
        });

        expect(unsetObservable(test, 'test.min').get()).toEqual({});
    });

    it('should unset deep object', () => {
        const test = observable({
            test: {
                bill: {
                    min: 'test',
                },
            },
        });

        expect(unsetObservable(test, 'test.bill.min').get()).toEqual({});
    });

    it('should unset the including multiple field object', () => {
        const deep = {
            data: {
                firstName: 'test',
                clear: undefined,
                test: [{ data1: '' }, { data2: '' }],
                data: {
                    test: undefined,
                    test1: {
                        ref: {
                            test: '',
                        },
                    },
                },
            },
        };

        const test = observable({
            test: {
                bill: {
                    min: [{ deep }],
                },
                test: 'ha',
            },
        });

        expect(unsetObservable(test, 'test.bill.min[0].deep').get()).toEqual({
            test: {
                test: 'ha',
            },
        });
    });

    it('should unset the object in array', () => {
        const test = observable({
            test: [{ min: 'required' }],
        });
        expect(unsetObservable(test, 'test[0].min').get()).toEqual({});
    });

    it('should return empty object when inner object is empty object', () => {
        const test = observable({
            data: {
                firstName: {},
            },
        });

        expect(unsetObservable(test, 'data.firstName').get()).toEqual({});
    });

    it('should clear empty array', () => {
        const test = observable({
            data: {
                firstName: {
                    test: [
                        { name: undefined, email: undefined },
                        { name: 'test', email: 'last' },
                    ],
                    deep: {
                        last: [
                            { name: undefined, email: undefined },
                            { name: 'test', email: 'last' },
                        ],
                    },
                },
            },
        });

        expect(unsetObservable(test, 'data.firstName.test[0]').get()).toEqual({
            data: {
                firstName: {
                    test: [undefined, { name: 'test', email: 'last' }],
                    deep: {
                        last: [
                            { name: undefined, email: undefined },
                            { name: 'test', email: 'last' },
                        ],
                    },
                },
            },
        });

        const test2 = observable({
            arrayItem: [
                {
                    test1: undefined,
                    test2: undefined,
                },
            ],
            data: 'test',
        });

        expect(unsetObservable(test2, 'arrayItem[0].test1').get()).toEqual({
            arrayItem: [
                {
                    test2: undefined,
                },
            ],
            data: 'test',
        });
    });

    it('should only remove relevant data', () => {
        const data = observable({
            test: {},
            testing: {
                key1: 1,
                key2: [
                    {
                        key4: 4,
                        key5: [],
                        key6: null,
                        key7: '',
                        key8: undefined,
                        key9: {},
                    },
                ],
                key3: [],
            },
        });

        expect(unsetObservable(data, 'test').get()).toEqual({
            testing: {
                key1: 1,
                key2: [
                    {
                        key4: 4,
                        key5: [],
                        key6: null,
                        key7: '',
                        key8: undefined,
                        key9: {},
                    },
                ],
                key3: [],
            },
        });
    });

    it('should remove empty array item', () => {
        const data = observable({
            name: [
                {
                    message: 'test',
                },
            ],
        });

        expect(unsetObservable(data, 'name[0]').get()).toEqual({});
    });

    it('should not remove nested empty array item', () => {
        const data = observable({
            scenario: {
                steps: [
                    {
                        content: {
                            question: 'isRequired',
                        },
                    },
                ],
            },
        });

        expect(unsetObservable(data, 'scenario.steps[1].messages[0]').get()).toEqual({
            scenario: {
                steps: [
                    {
                        content: {
                            question: 'isRequired',
                        },
                    },
                ],
            },
        });
    });

    it('should not remove parent if boolean value exists in array', () => {
        const data = observable({
            test: [true, undefined, true],
        });

        expect(unsetObservable(data, 'test[2]').get()).toEqual({
            test: [true, undefined, undefined],
        });
    });

    it('should reset the array index', () => {
        const data = observable({
            test: [[{ name: 'test' }], [{ name: 'test1' }]],
        });
        unsetObservable(data, 'test.0.0.name');

        expect(data.get()).toEqual({
            test: [undefined, [{ name: 'test1' }]],
        });

        const data1 = observable({
            test: [[{ name: 'test' }], [{ name: 'test1' }]],
        });
        unsetObservable(data1, 'test.1.0.name');

        expect(data1.get()).toEqual({
            test: [[{ name: 'test' }], undefined],
        });

        const data2 = observable({
            test: [[[{ name: 'test' }]], [{ name: 'test1' }]],
        });
        unsetObservable(data2, 'test.0.0.0.name');

        expect(data2.get()).toEqual({
            test: [undefined, [{ name: 'test1' }]],
        });

        const data3 = observable({
            test: [[[{ name: 'test' }]], [[{ name: 'test1' }]]],
        });
        unsetObservable(data3, 'test.1.0.0.name');

        expect(data3.get()).toEqual({
            test: [[[{ name: 'test' }]], undefined],
        });

        const data4 = observable({
            test: {
                fields: ['1', '2'],
            },
        });
        unsetObservable(data4, 'test.fields.1');

        expect(data4.get()).toEqual({
            test: {
                fields: ['1', undefined],
            },
        });
    });

    describe('when there are remaining props', () => {
        it('should not unset the array', () => {
            const test: Observable<any> = observable({
                test: [{ firstName: 'test' }],
            });

            test.test.root.set({
                test: 'message',
            });

            unsetObservable(test, 'test.0.firstName');

            expect(test.test.root.get()).toBeDefined();
        });
    });

    describe('in presence of Array polyfills', () => {
        beforeAll(() => {
            // @ts-expect-error we want to test unset in presence of polyfills
            Array.prototype.somePolyfill = () => 123;
        });

        it('should delete empty arrays', () => {
            const data = observable({
                prop: [],
            });
            unsetObservable(data, 'prop.0');

            expect(data.prop.get()).toBeUndefined();
        });

        afterAll(() => {
            // @ts-expect-error we want to test unset in presence of polyfills
            delete Array.prototype.somePolyfill;
        });
    });
});
