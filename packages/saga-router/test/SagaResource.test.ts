import '@tg-resources/fetch-runtime';
import { Server } from 'http';

import {
    AbortError,
    InvalidResponseCode,
    RequestValidationError,
} from '@tg-resources/core';
import { FetchResource as Resource } from '@tg-resources/fetch';
import { expectedBuffer, getHostUrl, listen } from '@tg-resources/test-server';
import { getError } from '@tg-resources/test-utils';
import 'jest-extended';
import { SagaIterator } from 'redux-saga';
import { call, delay, race } from 'redux-saga/effects';

import { createSagaRouter, isSagaResource, SagaRequestConfig } from '../src';

import { configureStore } from './reduxStore';
import {
    addRequestConfig,
    createApi,
    expectError,
    expectResponse,
} from './utils';

const hostUrl = getHostUrl(3003);
let server: Server;
let store: ReturnType<typeof configureStore>;

beforeEach(() => {
    store = configureStore();
    server = listen(3003);
});

afterEach(() => {
    server.close();
});

describe('createSagaRouter functional', () => {
    test('non-string routes are ignored', () => {
        expect(() => {
            createSagaRouter(
                {
                    test: 1,
                } as any,
                {
                    apiRoot: hostUrl,
                    mutateRequestConfig: addRequestConfig,
                },
                Resource
            );
        }).toThrow(/Unknown type used "test"/);
    });

    test('isSagaResource works', () => {
        const { api } = createApi(hostUrl, Resource);

        expect(isSagaResource(api.dogs.details)).toBeTrue();
        expect(isSagaResource(api.dogs.details.resource)).toBeFalse();
        expect(isSagaResource('test')).toBeFalse();
        expect(isSagaResource({ resource: {} })).toBeFalse();
    });

    test('mutate requestConfig works', async () => {
        const { api } = createApi(hostUrl, Resource);
        await expectResponse(
            store.runSaga(api.auth.getEffect()),
            { authenticated: true },
            store
        );
    });

    test('get `/hello` works', async () => {
        const { api } = createApi(hostUrl, Resource);
        await expectResponse(
            store.runSaga(api.hello.getEffect()),
            { message: 'world' },
            store
        );
    });

    test('fetch `/hello` works', async () => {
        const { api } = createApi(hostUrl, Resource);
        await expectResponse(
            store.runSaga(api.hello.fetchEffect()),
            { message: 'world' },
            store
        );
    });

    test('head `/hello` works :: call', async () => {
        const { api } = createApi(hostUrl, Resource);
        await expectResponse(store.runSaga(api.hello.headEffect()), {}, store);
    });

    test('options `/options` works :: call', async () => {
        const { api } = createApi(hostUrl, Resource);
        await expectResponse(
            store.runSaga(api.options.optionsEffect()),
            { message: 'options' },
            store
        );
    });

    test('url encoded data works :: call', async () => {
        const { api } = createApi(hostUrl, Resource);
        await expectResponse(
            store.runSaga(api.urlEncoded.postEffect(null, 'test=1')),
            { data: { test: '1' } },
            store
        );
    });

    test('patch request works :: call', async () => {
        const { api } = createApi(hostUrl, Resource);
        const params = { pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' };
        const data = { name: 'Johnty' };

        await expectResponse(
            store.runSaga(api.dogs.details.patchEffect(params, data)),
            params,
            store
        );
        await expectResponse(
            store.runSaga(api.dogs.details.getEffect(params)),
            { ...params, ...data },
            store
        );
    });

    test('put request works :: call', async () => {
        const { api } = createApi(hostUrl, Resource);
        const data = { name: 'Rex' };

        await expectResponse(
            store.runSaga(api.dogs.list.putEffect(null, data)),
            null,
            store
        );
        expect(store.getState()).toContainKey('pk');

        const { pk } = store.getState();
        await expectResponse(
            store.runSaga(api.dogs.details.getEffect({ pk })),
            { pk, ...data },
            store
        );
    });

    test('del request works :: call', async () => {
        const { api } = createApi(hostUrl, Resource, addRequestConfig);
        const params = { pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' };

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);
        });

        await expectResponse(
            store.runSaga(
                api.dogs.details.delEffect(params, null, null, null, {
                    onSagaRequestError: onError,
                })
            ),
            null,
            store
        );

        const error = await getError<InvalidResponseCode>(() =>
            store.runSaga(api.dogs.details.getEffect(params)).toPromise()
        );

        expect(error).toBeInstanceOf(InvalidResponseCode);
        expect(error.statusCode).toEqual(404);

        expect(store.getState()).toEqual(null);
    });

    test('statusValidationError is handled properly', async () => {
        const { api } = createApi(hostUrl, Resource);

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(RequestValidationError);
            expect(err.statusCode).toEqual(413);

            throw err;
        });

        await expectError(
            store.runSaga(
                api.error413.postEffect(null, { name: '' }, null, null, {
                    statusValidationError: [400, 413],
                    onSagaRequestError: onError,
                })
            ),
            {
                errorCls: RequestValidationError,
                statusCode: 413,
                hasError: true,
                errorString: 'name: This field is required.',
            }
        );
    });

    test('statusValidationError is handled properly - nonField only', async () => {
        const { api } = createApi(hostUrl, Resource);

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(RequestValidationError);
            expect(err.statusCode).toEqual(400);

            throw err;
        });

        await expectError(
            store.runSaga(
                api.error400_nonField.getEffect(null, null, {
                    onSagaRequestError: onError,
                })
            ),
            {
                errorCls: RequestValidationError,
                statusCode: 400,
                hasError: true,
                errorString: 'Sup dog',
            }
        );

        expect(onError.mock.calls.length).toEqual(1);
    });

    test('del request works :: initialized w/ onSagaRequestError', async () => {
        const { api } = createApi(hostUrl, Resource, addRequestConfig);
        const params = { pk: 'dd42e1d8-629e-48a1-9e96-42f7b1fdc167' };

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);

            throw err;
        });

        const requestConfig: SagaRequestConfig = {
            onSagaRequestError: onError,
        };

        await expectResponse(
            store.runSaga(
                api.dogs.details.deleteEffect(
                    params,
                    null,
                    null,
                    null,
                    requestConfig
                )
            ),
            null,
            store
        );

        let error = await getError<InvalidResponseCode>(() =>
            store
                .runSaga(
                    api.dogs.details.getEffect(params, null, requestConfig)
                )
                .toPromise()
        );

        expect(error).toBeInstanceOf(InvalidResponseCode);
        expect(error.statusCode).toEqual(404);

        expect(onError.mock.calls.length).toEqual(1);

        expect(store.getState()).toEqual(null);

        error = await getError<InvalidResponseCode>(() =>
            store
                .runSaga(
                    api.dogs.details.deleteEffect(
                        params,
                        null,
                        null,
                        null,
                        requestConfig
                    )
                )
                .toPromise()
        );

        expect(error).toBeInstanceOf(InvalidResponseCode);
        expect(error.statusCode).toEqual(404);

        expect(onError.mock.calls.length).toEqual(2);
    });

    test('attachments require allowAttachments=true', async () => {
        const { api } = createApi(hostUrl, Resource, addRequestConfig);
        const onError = jest.fn((err: any, _0: any, _1: any) => {
            expect(`${err}`).toEqual(
                'Error: Misconfiguration: "allowAttachments=true" is required when sending attachments!'
            );
        });

        const attachments = [
            {
                field: 'text',
                file: expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        const error = await getError<InvalidResponseCode>(() =>
            store
                .runSaga(
                    api.attachments.postEffect(null, null, null, attachments, {
                        onSagaRequestError: onError,
                    })
                )
                .toPromise()
        );

        expect(onError.mock.calls.length).toEqual(1);
        expect(`${error}`).toEqual(
            'Error: Misconfiguration: "allowAttachments=true" is required when sending attachments!'
        );
    });

    test('attachments work', async () => {
        const { api } = createApi(hostUrl, Resource);

        const postData = {
            name: 'foo',
            ignored0: null,
            ignored1: undefined,
            bool0: false,
            bool1: true,
            array: ['first!', 'first! E: missed it'],
            object: {
                foo: 1,
                bar: 0,
            },
        };

        const attachments = [
            {
                field: 'text',
                file:
                    typeof Blob !== 'undefined'
                        ? new Blob([expectedBuffer])
                        : expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        await store
            .runSaga(
                api.attachments.postEffect(null, postData, null, attachments, {
                    allowAttachments: true,
                })
            )
            .toPromise();
        const response = store.getState();

        expect(response).toEqual({
            name: 'foo',
            text: {
                name: 'dummy.txt',
                size: expectedBuffer.length,
            },
            bool0: 'false',
            bool1: 'true',
            array: postData.array,
            object: JSON.stringify(postData.object),
        });
    });

    test('aborting with signal manually raises a wrapped AbortError', async () => {
        const controller = new AbortController();
        const onError = jest.fn((error: any) => {
            expect(`${error}`).toEqual(
                'AbortError: The user aborted a request.'
            );
            expect(error).toBeInstanceOf(AbortError);
        });

        const { api } = createApi(hostUrl, Resource);

        function* runner() {
            yield api.abortingResource.fetchEffect(null, null, {
                signal: controller.signal,
                onSagaRequestError: onError,
            });
        }

        setTimeout(() => {
            controller.abort();
        }, 10);

        const error = await getError<AbortError>(() =>
            store.sagaMiddleware.run(runner).toPromise()
        );

        // We are expecting the promise to reject with an AbortError
        expect(error).toBeInstanceOf(AbortError);
        expect(error).toMatchObject({
            isAbortError: true,
            type: 'aborted',
            name: 'AbortError',
        });

        expect(onError.mock.calls.length).toEqual(1);
    });

    test('internal AbortController exits early', async () => {
        const onError = jest.fn((error: any) => {
            // We are expecting the promise to reject with an AbortError
            expect(error).toBeInstanceOf(AbortError);
            expect(error).toMatchObject({
                isAbortError: true,
                type: 'aborted',
                name: 'AbortError',
            });
        });

        const { api } = createApi(hostUrl, Resource);

        function* runner() {
            yield api.abortingResource.fetchEffect(null, null, {
                onSagaRequestError: onError,
            });
            return true;
        }

        function* execWithCancel(): SagaIterator<{
            result: boolean;
            cancelled: boolean;
        }> {
            return yield race({
                result: call(runner),
                cancelled: delay(100, true),
            });
        }

        const res: {
            result: boolean;
            cancelled: boolean;
        } = await store.sagaMiddleware.run(execWithCancel).toPromise();

        // With internal AbortController, finally is triggered before and then no error handler is called
        expect(onError.mock.calls.length).toEqual(0);

        expect(res).toEqual({ cancelled: true });
    });

    test('should reject immediately if signal has already been aborted', async () => {
        const controller = new AbortController();
        const onError = jest.fn((error: any) => {
            expect(`${error}`).toEqual(
                'AbortError: The user aborted a request.'
            );
            expect(error).toBeInstanceOf(AbortError);
        });

        const { api } = createApi(hostUrl, Resource);

        const error = await getError<AbortError>(() => {
            controller.abort();
            return store
                .runSaga(
                    api.abortingResource.getEffect(null, null, {
                        signal: controller.signal,
                        onSagaRequestError: onError,
                    })
                )
                .toPromise();
        });
        // We are expecting the promise to reject with an AbortError
        expect(error).toBeInstanceOf(AbortError);
        expect(error).toMatchObject({
            isAbortError: true,
            type: 'aborted',
            name: 'AbortError',
        });

        expect(onError.mock.calls.length).toEqual(1);
    });
});
