import {
    RequestConfig,
    Resource,
    ResourceClassConstructor,
    ResourceTuple,
} from '@tg-resources/core';
import { Task } from 'redux-saga';

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

// todo: switch from testing with express to unit testing
// const createResourceSpys = <T extends SagaResource<any>>(resource: T) => ({
//     get: jest.spyOn(resource.resource, 'get'),
//     head: jest.spyOn(resource.resource, 'head'),
//     options: jest.spyOn(resource.resource, 'options'),
//     post: jest.spyOn(resource.resource, 'post'),
//     patch: jest.spyOn(resource.resource, 'patch'),
//     put: jest.spyOn(resource.resource, 'put'),
//     delete: jest.spyOn(resource.resource, 'delete'),
// });

export const createApi = <Klass extends Resource>(
    hostUrl: string,
    ResourceKlass: ResourceClassConstructor<Klass>,
    mutate?: MutatedRequestConfigFn
) => {
    const api = createSagaRouter(
        {
            auth: [
                '/headers',
                { headers: () => ({ auth: 'foo' }), withCredentials: true },
            ] as ResourceTuple,
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

    const apiMocks = {
        // auth: createResourceSpys(api.auth),
        // hello: createResourceSpys(api.hello),
        // options: createResourceSpys(api.options),
        // attachments: createResourceSpys(api.attachments),
        // abortingResource: createResourceSpys(api.abortingResource),
        // dogs: {
        //     list: createResourceSpys(api.dogs.list),
        //     details: createResourceSpys(api.dogs.details),
        // },
        // error413: createResourceSpys(api.error413),
        // error400_nonField: createResourceSpys(api.error400_nonField),
        // urlEncoded: createResourceSpys(api.urlEncoded),
    };

    return { api, apiMocks };
};

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
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw error;
    }
}
