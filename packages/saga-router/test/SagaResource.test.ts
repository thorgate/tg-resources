import { FetchResource as Resource } from '@tg-resources/fetch';
import { expectedBuffer, getHostUrl, listen } from '@tg-resources/test-server';
import { Server } from 'http';
import 'jest-extended';
import { InvalidResponseCode, RequestValidationError } from 'tg-resources';

import { createSagaRouter, SagaRequestConfig } from '../src';
import { configureStore } from './reduxStore';
import { addRequestConfig, createApi, expectError, expectResponse } from './utils';


const port = 3003;

const hostUrl = getHostUrl(port);

let server: Server;

let store: ReturnType<typeof configureStore>;


beforeEach(() => {
    store = configureStore();
    server = listen(port);
});

afterEach(() => {
    server.close();
});


describe('createSagaRouter functional', () => {
    test('non-string routes are ignored', () => {
        expect(() => {
            createSagaRouter({
                test: 1,
            } as any, {
                apiRoot: hostUrl,
                mutateRequestConfig: addRequestConfig,
            }, Resource);
        }).toThrow(/Unknown type used "test"/);
    });

    test('mutate requestConfig works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        await expectResponse(store.runSaga(api.auth.fetch()), { authenticated: true }, store);
    });

    test('mutate requestConfig works :: initialized', async () => {
        const api = createApi(hostUrl, Resource);

        const iter = api.auth.fetch(null, null, { initializeSaga: true }, store);
        await expectResponse(store.runSagaInitialized(iter), { authenticated: true }, store);
    });

    test('fetch `/hello` works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        await expectResponse(store.runSaga(api.hello.fetch()), { message: 'world' }, store);
    });

    test('fetch `/hello` works :: initialized', async () => {
        const api = createApi(hostUrl, Resource);

        const iter = store.runSagaInitialized(api.hello.fetch(null, null, { initializeSaga: true }));

        await expectResponse(iter, { message: 'world' }, store);
    });

    test('head `/hello` works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        await expectResponse(store.runSaga(api.hello.head()), {}, store);
    });

    test('options `/options` works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        await expectResponse(store.runSaga(api.options.options()), { message: 'options' }, store);
    });

    test('url encoded data works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        await expectResponse(
            store.runSaga(api.urlEncoded.post(null, 'test=1')), { data: { test: '1' } }, store,
        );
    });

    test('patch request works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        const params = { pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' };
        const data = { name: 'Johnty' };

        await expectResponse(store.runSaga(api.dogs.details.patch(params, data)), params, store);
        await expectResponse(store.runSaga(api.dogs.details.fetch(params)), { ...params, ...data }, store);
    });

    test('put request works :: call', async () => {
        const api = createApi(hostUrl, Resource);
        const data = { name: 'Rex' };

        await expectResponse(store.runSaga(api.dogs.list.put(null, data)), null, store);
        expect(store.getState()).toContainKey('pk');

        const pk = store.getState().pk;
        await expectResponse(store.runSaga(api.dogs.details.fetch({ pk })), { pk, ...data }, store);
    });

    test('del request works :: call', async () => {
        const api = createApi(hostUrl, Resource, addRequestConfig);
        const params = { pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' };

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);
        });

        await expectResponse(store.runSaga(api.dogs.details.del(
            params, null, null, null, { onRequestError: onError },
        )), { deleted: true }, store);

        try {
            await store.runSaga(api.dogs.details.fetch(params)).toPromise();
        } catch (err) {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);
        }

        expect(store.getState()).toEqual({ deleted: true });
    });

    test('statusValidationError is handled properly', async () => {
        const api = createApi(hostUrl, Resource);

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(RequestValidationError);
            expect(err.statusCode).toEqual(413);

            throw err;
        });

        await expectError(
            store.runSagaInitialized(api.error413.post(null, { name: '' }, null, null, {
                statusValidationError: [400, 413], initializeSaga: true, onRequestError: onError,
            })), {
                errorCls: RequestValidationError,
                statusCode: 413,
                hasError: true,
                errorString: 'name: This field is required.',
            },
        );
    });

    test('statusValidationError is handled properly - nonField only', async () => {
        const api = createApi(hostUrl, Resource);

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(RequestValidationError);
            expect(err.statusCode).toEqual(400);

            throw err;
        });

        await expectError(
            store.runSagaInitialized(api.error400_nonField.fetch(null, null, {
                initializeSaga: true, onRequestError: onError,
            })),
            {
                errorCls: RequestValidationError,
                statusCode: 400,
                hasError: true,
                errorString: 'Sup dog',
            },
        );

        expect(onError.mock.calls.length).toEqual(1);
    });

    test('del request works :: initialized w/ onRequestError', async () => {
        const api = createApi(hostUrl, Resource, addRequestConfig);
        const params = { pk: 'dd42e1d8-629e-48a1-9e96-42f7b1fdc167' };

        const onError = jest.fn((err: any) => {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);

            throw err;
        });

        const requestConfig: SagaRequestConfig = {
            initializeSaga: true,
            onRequestError: onError,
        };

        await expectResponse(
            store.runSagaInitialized(api.dogs.details.del(params, null, null, null, requestConfig)),
            { deleted: true }, store,
        );

        try {
            await store.runSagaInitialized(api.dogs.details.fetch(params, null, requestConfig)).toPromise();
        } catch (err) {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);

            expect(onError.mock.calls.length).toEqual(1);
        }

        expect(store.getState()).toEqual({ deleted: true });

        try {
            await store.runSagaInitialized(api.dogs.details.del(params, null, null, null, requestConfig)).toPromise();
        } catch (err) {
            expect(err).toBeInstanceOf(InvalidResponseCode);
            expect(err.statusCode).toEqual(404);

            expect(onError.mock.calls.length).toEqual(2);
        }
    });

    test('attachments require allowAttachments=true :: call', async () => {
        const api = createApi(hostUrl, Resource, addRequestConfig);
        const onError = jest.fn((err: any) => {
            expect(`${err}`).toEqual(
                'Error: Misconfiguration: "allowAttachments=true" is required when sending attachments!',
            );
        });

        const attachments = [
            {
                field: 'text',
                file: expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        try {
            await store.runSaga(api.attachments.post(null, null, null, attachments, {
                onRequestError: onError,
            })).toPromise();
        } catch (err) {
            expect(onError.mock.calls.length).toEqual(1);
            expect(`${err}`).toEqual(
                'Error: Misconfiguration: "allowAttachments=true" is required when sending attachments!',
            );
        }
    });

    test('attachments require allowAttachments=true :: initialized', async () => {
        const api = createApi(hostUrl, Resource, addRequestConfig);
        const onError = jest.fn((err: any) => {
            expect(`${err}`).toEqual(
                'Error: Misconfiguration: "allowAttachments=true" is required when sending attachments!',
            );
        });

        const attachments = [
            {
                field: 'text',
                file: expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        try {
            await store.runSagaInitialized(api.attachments.post(null, null, null, attachments, {
                initializeSaga: true, onRequestError: onError,
            })).toPromise();
        } catch (err) {
            expect(onError.mock.calls.length).toEqual(1);
            expect(`${err}`).toEqual(
                'Error: Misconfiguration: "allowAttachments=true" is required when sending attachments!',
            );
        }
    });

    test('attachments work', async () => {
        const api = createApi(hostUrl, Resource);

        const postData = {
            name: 'foo',
            ignored0: null,
            ignored1: undefined,
            bool0: false,
            bool1: true,
            array: [
                'first!',
                'first! E: missed it',
            ],
            object: {
                foo: 1,
                bar: 0,
            },
        };

        const attachments = [
            {
                field: 'text',
                file: expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        await store.runSaga(
            api.attachments.post(null, postData, null, attachments, {
                allowAttachments: true,
            }),
        ).toPromise();
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
});
