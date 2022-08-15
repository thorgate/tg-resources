import { Task } from 'redux-saga';
import {
    RequestConfig,
    Resource,
    ResourceClassConstructor,
} from 'tg-resources';

import { createSagaRouter, MutatedRequestConfigFn } from '../src';

import { configureStore } from './reduxStore';

export function addRequestConfig(requestConfig?: RequestConfig): RequestConfig {
    const newConfig = {
        headers: () => ({ auth: 'foo' }),
        withCredentials: true,
    };

    if (requestConfig) {
        return {
            ...requestConfig,
            ...newConfig,
        };
    }

    return newConfig;
}

export const createApi = <Klass extends Resource>(
    hostUrl: string,
    ResourceKlass: ResourceClassConstructor<Klass>,
    mutate?: MutatedRequestConfigFn
) =>
    createSagaRouter(
        {
            auth: [
                '/headers',
                { headers: () => ({ auth: 'foo' }), withCredentials: true },
            ],
            hello: '/hello',
            options: '/options',
            attachments: '/attachments',
            abortingResource: '/abort',
            dogs: {
                list: '/dogs/',
                details: '/dogs/${pk}',
            },
            error413: '/error413',
            error400_nonField: '/error400_nonField',
            urlEncoded: '/url-encoded',
        },
        {
            apiRoot: hostUrl,
            mutateRequestConfig: mutate,
        },
        ResourceKlass
    );

export async function expectResponse(
    task: Task,
    expectedData: any | null,
    store: ReturnType<typeof configureStore>
) {
    await task.toPromise();

    if (expectedData) {
        expect(store.getState()).toEqual(expectedData);
    }
}

interface ErrorInfo {
    errorCls?: any;
    statusCode?: number;
    responseText?: string;
    errorString?: string;
    hasError?: boolean;
    exactError?: any[];
}

export async function expectError(
    task: Task,
    {
        errorCls,
        statusCode,
        responseText,
        exactError,
        errorString,
        hasError,
    }: ErrorInfo
) {
    let errorHandled = true;
    let error = null;

    try {
        await task.toPromise();
        errorHandled = false;
    } catch (err: any) {
        try {
            if (exactError) {
                expect(err).toEqual(exactError);
            }

            if (errorCls) {
                expect(
                    `${err} is not a subclass of ${errorCls}: ${
                        err instanceof errorCls
                    }`
                ).toEqual(`${err} is not a subclass of ${errorCls}: true`);
            }

            if (typeof hasError !== 'undefined') {
                expect(err.hasError()).toEqual(hasError);
            }

            if (statusCode) {
                expect(err.statusCode).toEqual(statusCode);
            }

            if (errorString) {
                expect(err.errors.toString()).toEqual(errorString);
            }

            if (responseText) {
                expect(err.responseText).toEqual(responseText);
            }
        } catch (e) {
            error = e;
        }
    }

    if (!errorHandled) {
        throw new Error(
            `Expected request to fail with ${{
                errorCls,
                statusCode,
                responseText,
            }}`
        );
    }

    if (error) {
        throw error;
    }
}
