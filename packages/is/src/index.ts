export const isArray = Array.isArray;


export const hasValue = <T = any>(value: T | undefined | null): value is T => (
    typeof value !== 'undefined' && value !== null
);


type IsFunction<T> = T extends (...args: any[]) => any ? T : never;
export const isFunction = <T extends {} | null | undefined>(value: T): value is IsFunction<T> => (
    typeof value === 'function'
);


export const isObject = (value: any): value is object => (
    !!value && !isArray(value) && typeof value === 'object'
);


export const isString = (value: any): value is string => (
    typeof value === 'string'
);


export const isStringArray = (value: any): value is string[] => (
    isArray(value) && value.length > 0 && value.every((x) => isString(x))
);


export const isNumber = (value: any): value is number => (
    typeof value === 'number'
);


export const isStatusCode = (statusCodes: number | number[], status: any): status is number => (
    hasValue(status) && (
        isArray(statusCodes) && statusCodes.indexOf(status) !== -1 ||
        isNumber(statusCodes) && statusCodes === status
    )
);

export const isAbortSignal = (signal: any): signal is AbortSignal => {
    const proto = (
        signal
        && typeof signal === 'object'
        && Object.getPrototypeOf(signal)
    );
    return !!(proto && proto.constructor.name === 'AbortSignal');
};


export interface Constructable<T> {
    new(...args: any[]): T;
}
