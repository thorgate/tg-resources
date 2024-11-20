/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const isArray = Array.isArray; // eslint-disable-line prefer-destructuring

export const hasValue = <T = any>(
    value: T | undefined | null
): value is NonNullable<T> => typeof value !== 'undefined' && value !== null;

type IsFunction<T> = T extends (...args: any[]) => any ? T : never;
export const isFunction = <
    T extends
        | Record<string, unknown>
        | ((...args: any[]) => any)
        | unknown
        | null
        | undefined
>(
    value: T
): value is IsFunction<T> => typeof value === 'function';

export const isObject = (value: any): value is Record<string, unknown> =>
    !!value && !isArray(value) && typeof value === 'object';

export const isString = (value: any): value is string =>
    typeof value === 'string';

export const isStringArray = (value: any): value is string[] =>
    isArray(value) && value.length > 0 && value.every((x) => isString(x));

export const isNumber = (value: any): value is number =>
    typeof value === 'number';

export const isStatusCode = (
    statusCodes: number | number[],
    status: any
): status is number =>
    hasValue(status) &&
    isNumber(status) &&
    ((isArray(statusCodes) && statusCodes.indexOf(status) !== -1) ||
        (isNumber(statusCodes) && statusCodes === status));

export const isAbortSignal = (signal: any): signal is AbortSignal => {
    const proto =
        !!signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
    // Fail-safe fallback, is required to work with some browsers that do not have native implementation of AbortSignal
    const isCompatible =
        !!signal &&
        typeof signal.aborted !== 'undefined' &&
        typeof signal.onabort !== 'undefined';
    return (
        !!(proto && proto.constructor.name === 'AbortSignal') || isCompatible
    );
};

export type IsAny<T, True, False = never> =
    // test if we are going the left AND right path in the condition
    true | false extends (T extends never ? true : false) ? True : False;

export type IfVoid<P, True, False> = [void] extends [P] ? True : False;
