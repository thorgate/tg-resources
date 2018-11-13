/* tslint:disable no-empty */
import { hasValue, isArray, isFunction, isNumber, isObject, isStatusCode, isString, isStringArray } from '../src';


const mockFn = jest.fn(<T>(value: T) => value);


beforeEach(() => {
    mockFn.mockReset();
});

describe('typeChecks api', () => {
    test('isArray works', () => {
        const testArgs = [[], {}, true, null];
        testArgs.forEach((t) => {
            if (isArray(t)) {
                mockFn(t);
            }
        });

        expect(mockFn).toBeCalledTimes(1);

        expect(isArray(null)).toEqual(false);
        expect(isArray('hello')).toEqual(false);
        expect(isArray(undefined)).toEqual(false);
        expect(isArray(false)).toEqual(false);
        expect(isArray(true)).toEqual(false);
        expect(isArray(1)).toEqual(false);
        expect(isArray({})).toEqual(false);
        expect(isArray(NaN)).toEqual(false);
        expect(isArray([])).toEqual(true);
    });

    test('hasValue works', () => {
        // Testing type limiting
        const testArgs: Array<string | number | boolean | null> = [1, 'a - b', true, null];
        testArgs.forEach((t) => {
            if (hasValue(t)) {
                mockFn(t);
            }
        });

        expect(mockFn).toBeCalledTimes(3);

        expect(hasValue(null)).toEqual(false);
        expect(hasValue(undefined)).toEqual(false);

        expect(hasValue('world')).toEqual(true);
        expect(hasValue(false)).toEqual(true);
        expect(hasValue(true)).toEqual(true);
        expect(hasValue(1)).toEqual(true);
        expect(hasValue({})).toEqual(true);
        expect(hasValue([])).toEqual(true);
        expect(hasValue(NaN)).toEqual(true);
    });

    test('isFunction works', () => {
        // Testing type limiting
        const testArgs = [
            () => {},
            () => null,
            null,
        ];

        testArgs.forEach((t) => {
            if (isFunction(t)) {
                mockFn(t());
            }
        });

        expect(mockFn).toBeCalledTimes(2);

        expect(isFunction(null)).toEqual(false);
        expect(isFunction(undefined)).toEqual(false);
        expect(isFunction(false)).toEqual(false);
        expect(isFunction(true)).toEqual(false);
        expect(isFunction(1)).toEqual(false);
        expect(isFunction({})).toEqual(false);
        expect(isFunction([])).toEqual(false);
        expect(isFunction(NaN)).toEqual(false);
        expect(isFunction('my')).toEqual(false);

        expect(isFunction(function f() {})).toEqual(true);
        expect(isFunction(() => 1)).toEqual(true);
        expect(isFunction(hasValue)).toEqual(true);
    });

    test('isObject works', () => {
        const testArgs = [{}, 'a', true, null, Object()];
        testArgs.forEach((t) => {
            if (isObject(t)) {
                mockFn(t);
            }
        });
        expect(mockFn).toBeCalledTimes(2);

        expect(isObject(null)).toEqual(false);
        expect(isObject(undefined)).toEqual(false);
        expect(isObject(false)).toEqual(false);
        expect(isObject(true)).toEqual(false);
        expect(isObject(1)).toEqual(false);
        expect(isObject([])).toEqual(false);
        expect(isObject(NaN)).toEqual(false);
        expect(isObject(function f() {})).toEqual(false);
        expect(isObject(() => 1)).toEqual(false);
        expect(isObject(isFunction)).toEqual(false);
        expect(isObject('name')).toEqual(false);

        expect(isObject({})).toEqual(true);
        expect(isObject(Object())).toEqual(true);
    });

    test('isString works', () => {
        expect(isString(null)).toEqual(false);
        expect(isString(undefined)).toEqual(false);
        expect(isString(false)).toEqual(false);
        expect(isString(true)).toEqual(false);
        expect(isString(1)).toEqual(false);
        expect(isString([])).toEqual(false);
        expect(isString(NaN)).toEqual(false);
        expect(isString(function f() {})).toEqual(false);
        expect(isString(() => 1)).toEqual(false);
        expect(isString(isFunction)).toEqual(false);
        expect(isString({})).toEqual(false);
        expect(isString(Object())).toEqual(false);

        expect(isString('is')).toEqual(true);
    });

    test('isNumber works', () => {
        expect(isNumber(null)).toEqual(false);
        expect(isNumber(undefined)).toEqual(false);
        expect(isNumber(false)).toEqual(false);
        expect(isNumber(true)).toEqual(false);
        expect(isNumber([])).toEqual(false);
        expect(isNumber(function f() {})).toEqual(false);
        expect(isNumber(() => 1)).toEqual(false);
        expect(isNumber(isFunction)).toEqual(false);
        expect(isNumber({})).toEqual(false);
        expect(isNumber(Object())).toEqual(false);
        expect(isNumber('TEST')).toEqual(false);

        expect(isNumber(NaN)).toEqual(true);
        expect(isNumber(10)).toEqual(true);
        expect(isNumber(10.01)).toEqual(true);
    });

    test('isStatusCode works', () => {
        expect(isStatusCode(200, null)).toEqual(false);
        expect(isStatusCode(200, undefined)).toEqual(false);
        expect(isStatusCode(200, false)).toEqual(false);
        expect(isStatusCode(200, true)).toEqual(false);
        expect(isStatusCode([], 10)).toEqual(false);
        expect(isStatusCode(200, function f() {})).toEqual(false);
        expect(isStatusCode(200, () => 1)).toEqual(false);
        expect(isStatusCode(200, isFunction)).toEqual(false);
        expect(isStatusCode(200, {})).toEqual(false);
        expect(isStatusCode(200, Object())).toEqual(false);
        expect(isStatusCode(200, 'TEST')).toEqual(false);

        expect(isStatusCode(200, 200)).toEqual(true);
        expect(isStatusCode([200], 200)).toEqual(true);
        expect(isStatusCode([200, 400], 400)).toEqual(true);
    });

    test('isStringArray works', () => {
        expect(isStringArray(null)).toEqual(false);
        expect(isStringArray(undefined)).toEqual(false);
        expect(isStringArray(false)).toEqual(false);
        expect(isStringArray(true)).toEqual(false);
        expect(isStringArray(1)).toEqual(false);
        expect(isStringArray(NaN)).toEqual(false);
        expect(isStringArray(function f() {})).toEqual(false);
        expect(isStringArray(() => 1)).toEqual(false);
        expect(isStringArray(isFunction)).toEqual(false);
        expect(isStringArray({})).toEqual(false);
        expect(isStringArray(Object())).toEqual(false);
        expect(isStringArray('is string')).toEqual(false);
        expect(isStringArray([])).toEqual(false);

        expect(isStringArray(['is', 'string', 'array'])).toEqual(true);
    });
});
