import { hasValue, isAbortSignal, isArray, isNumber, isObject, isString } from '@tg-resources/is';
import cookie from 'cookie';

import { ConfigType, ObjectMap, RequestConfig, ResourceFetchMethods, ResourcePostMethods } from './types';


export const isFetchMethod = (method: string): method is ResourceFetchMethods => (
    ['fetch', 'head', 'options'].includes(method)
);

export const isPostMethod = (method: string): method is ResourcePostMethods => (
    ['post', 'patch', 'put', 'del'].includes(method)
);


export function mergeConfig(...config: RequestConfig[]): ConfigType {
    const res: RequestConfig = {};

    config.filter((x) => !!x).forEach((opts) => Object.assign(res, opts));

    if (res.statusSuccess) {
        if (!isArray(res.statusSuccess) && hasValue(res.statusSuccess) && isNumber(res.statusSuccess)) {
            res.statusSuccess = [res.statusSuccess];
        }
    }

    if (res.statusValidationError) {
        if (!isArray(res.statusValidationError) && hasValue(res.statusValidationError) && isNumber(res.statusValidationError)) {
            res.statusValidationError = [res.statusValidationError];
        }
    }

    if (res.signal && !isAbortSignal(res.signal)) {
        throw new Error(`Expected signal to be an instanceof AbortSignal`);
    }

    // Expect to be filled by now - we use default config which will fill all the right data
    return res as ConfigType;
}


export function truncate(value: any, limit: number) {
    if (!value || value.length < limit) {
        return value;
    }

    /* istanbul ignore else: safeguard */
    if (!isString(value)) {
        value = `${value}`;
    }

    return `${value.substring(0, limit - 3)}...`;
}


export function serializeCookies(cookieVal: ObjectMap<string | null>) {
    /* istanbul ignore else: safeguard */
    if (isObject(cookieVal)) {
        // istanbul ignore next: Tested in package that implement Resource
        return Object.keys(cookieVal)
            .filter((key: string) => hasValue(cookieVal[key]))
            .map((key: string) => cookie.serialize(key, (cookieVal[key] as string)))
            .join('; ');
    }

    /* istanbul ignore next: safeguard */
    return null;
}
