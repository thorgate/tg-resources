import '@tg-resources/fetch-runtime';
import { isObject } from '@tg-resources/is';
import * as testServer from '@tg-resources/test-server';
import 'jest-extended';
import {
    AbortError,
    NetworkError,
    RequestValidationError,
    ResourceErrorInterface,
    ResourceInterface,
    ResponseInterface,
} from 'tg-resources';

import { FetchResource as Resource, FetchResponse as Response } from '../src';

async function expectResponse(prom: Promise<any>, expectedData: any) {
    try {
        const data = await prom;
        expect(data).toEqual(expectedData);
    } catch (err: any) {
        throw new Error(`Request failed: ${err.toString()}`);
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

async function expectError(
    prom: Promise<any>,
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
        await prom;
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

let server: ReturnType<typeof testServer.listen>;
const hostUrl = testServer.getHostUrl(3002);

beforeEach(() => {
    server = testServer.listen(3002);
});

afterEach(() => {
    server.close();
});

describe('Resource basic requests work', () => {
    test('Network error is triggered', async () => {
        const res = new Resource('/', {
            apiRoot: testServer.getHostUrl(2999),
        });

        await expectError(res.fetch(), { errorCls: NetworkError });
    });

    test('fetch `/` works', async () => {
        const res = new Resource('/', {
            apiRoot: hostUrl,
            defaultAcceptHeader: 'text/html',
        });

        await expectResponse(res.fetch(), 'home');
    });

    test('fetch `/query` works w/ query strings', async () => {
        const res = new Resource('/query', {
            apiRoot: hostUrl,
        });

        await expectResponse(res.fetch(null, { test: '1' }), {
            data: { test: '1' },
        });
    });

    test('fetch `/` works w/ manual Accept header', async () => {
        const res = new Resource('/', {
            apiRoot: hostUrl,
            headers: {
                Accept: 'text/html',
            },
        });

        await expectResponse(res.fetch(), 'home');
    });

    test('fetch `/` is HTML even if Accept header is not explicitly set', async () => {
        const res = new Resource('/', {
            apiRoot: hostUrl,
        });

        await expectResponse(res.fetch(), 'home');
    });

    test('cfg.mutateResponse is called during fetch', async () => {
        const spyFn = jest.fn();

        const res = new Resource('/hello', {
            apiRoot: hostUrl,
            mutateResponse: spyFn,
        });

        await res.fetch();

        expect(spyFn.mock.calls.length).toEqual(1);
    });

    test('mutateResponse functionally works', async () => {
        const res = new Resource('/hello', {
            apiRoot: hostUrl,
            mutateResponse(data: any, raw?: Response) {
                return {
                    data,
                    poweredBy: isObject(raw)
                        ? raw.headers['x-powered-by']
                        : null,
                };
            },
        });

        await expectResponse(res.fetch(), {
            data: { message: 'world' },
            poweredBy: 'Express',
        });
    });

    test('cfg.mutateError is called during fetch', async () => {
        const spyFn = jest.fn();

        const res = new Resource('/error500', {
            apiRoot: hostUrl,
            mutateError: spyFn,
        });

        try {
            const response = await res.fetch();
            expect(response).toBeFalsy();
        } catch (err: any) {
            // spyFn does not return anything so we expect value to be empty
            expect(err).toBeFalsy();
            expect(spyFn.mock.calls.length).toBe(1);
        }
    });

    test('mutateError functionally works', async () => {
        const res = new Resource('/error500', {
            apiRoot: hostUrl,
            mutateError(
                error: ResourceErrorInterface,
                rawResponse?: ResponseInterface,
                resource?: ResourceInterface
            ) {
                if (!rawResponse) {
                    return [];
                }
                return [
                    'the error', // put a string here so comparison is easy
                    error.isInvalidResponseCode,
                    (rawResponse.statusCode || 0) + 1055,
                    (rawResponse.status || 0) + 1055,
                    (rawResponse.statusCode || 0) + 1055,
                    resource,
                    rawResponse.statusType,
                ];
            },
        });

        await expectError(res.fetch(), {
            exactError: [
                'the error',
                true,
                1555,
                1555,
                1555,
                res,
                5, // statusCode / 100 | 100
            ],
        });
    });

    test('cfg.mutateRawResponse is called during fetch', async () => {
        // Why would anyone do this... :(
        const spyFn = jest.fn(
            () =>
                new Response({
                    body: {
                        im: 'fake',
                    },
                    text: JSON.stringify({
                        im: 'fake',
                    }),
                    status: 200,
                    statusType: 'ok',
                    type: 'application/json',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
        );

        const res = new Resource('/hello', {
            apiRoot: hostUrl,
            mutateRawResponse: spyFn,
        });

        const data = await res.fetch();
        expect(spyFn.mock.calls.length).toEqual(1);
        expect(data).toEqual({ im: 'fake' });
    });

    test('fetch `/hello` works', async () => {
        const res = new Resource('/hello', {
            apiRoot: hostUrl,
        });

        await expectResponse(res.fetch(), { message: 'world' });
    });

    test('headers work as object', async () => {
        const res = new Resource('/headers', {
            apiRoot: hostUrl,
            headers: { auth: 'foo' },
            withCredentials: true,
        });

        await expectResponse(res.fetch(), { authenticated: true });
    });

    test('headers work as function', async () => {
        const res = new Resource('/headers', {
            apiRoot: hostUrl,
            headers: () => ({ auth: 'foo' }),
        });

        await expectResponse(res.fetch(), { authenticated: true });
    });

    test('cookies work as object', async () => {
        const res = new Resource('/cookies', {
            apiRoot: hostUrl,
            cookies: { sessionid: 'secret' },
        });

        await expectResponse(res.fetch(), { authenticated: true });
    });

    test('cookies work as function', async () => {
        const res = new Resource('/cookies', {
            apiRoot: hostUrl,
            cookies: () => ({ sessionid: 'secret' }),
        });

        await expectResponse(res.fetch(), { authenticated: true });
    });

    test('kwargs work', async () => {
        const res = new Resource('/dogs/${pk}', {
            apiRoot: hostUrl,
        });

        await expectResponse(
            res.fetch({ pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' }),
            {
                pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
                name: 'Lassie',
            }
        );

        await expectResponse(
            res.fetch({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }),
            {
                pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815',
                name: 'Cody',
            }
        );
    });

    test('head request works', async () => {
        const res = new Resource('/hello', {
            apiRoot: hostUrl,
        });

        await expectResponse(res.head(), {});
    });

    test('options request works', async () => {
        const res = new Resource('/options', {
            apiRoot: hostUrl,
        });

        await expectResponse(res.options(), { message: 'options' });
    });

    test('del request works', async () => {
        const res = new Resource('/dogs/${pk}', {
            apiRoot: hostUrl,
        });

        await expectResponse(
            res.del({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }),
            null
        );
        await expectError(
            res.fetch({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }),
            { statusCode: 404 }
        );
    });

    test('put request works', async () => {
        const listRes = new Resource('/dogs/', {
            apiRoot: hostUrl,
        });
        const detailRes = new Resource('/dogs/${pk}', {
            apiRoot: hostUrl,
        });

        interface Dog {
            pk: string;
            name: string;
        }

        const data = await listRes.put<Dog>(null, { name: 'Rex' });
        expect(data).toContainKey('pk');

        try {
            await expectResponse(detailRes.fetch({ pk: data.pk }), {
                pk: data.pk,
                name: 'Rex',
            });
        } catch (err: any) {
            throw new Error(
                `Put works :: fetch request failed: ${err.toString()}`
            );
        }
    });

    test('patch request works', async () => {
        const res = new Resource('/dogs/${pk}', {
            apiRoot: hostUrl,
        });

        const params = { pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' };

        await expectResponse(res.patch(params, { name: 'Johnty' }), params);
        await expectResponse(res.fetch(params), {
            pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
            name: 'Johnty',
        });
    });

    test('url encoded data works', async () => {
        const res = new Resource('/url-encoded', {
            apiRoot: hostUrl,
        });

        await expectResponse(res.post(null, 'test=1'), { data: { test: '1' } });
    });

    test('statusValidationError is handled properly', async () => {
        const res = new Resource('/error413', {
            apiRoot: hostUrl,
        });

        await expectError(
            res.post(null, { name: '' }, undefined, undefined, {
                statusValidationError: [400, 413],
            }),
            {
                errorCls: RequestValidationError,
                statusCode: 413,
                hasError: true,
                errorString: 'name: This field is required.',
            }
        );
    });

    test('statusValidationError is handled properly - nonField only', async () => {
        const res = new Resource('/error400_nonField', {
            apiRoot: hostUrl,
        });

        await expectError(res.fetch(null), {
            errorCls: RequestValidationError,
            statusCode: 400,
            hasError: true,
            errorString: 'Sup dog',
        });
    });

    test('attachments require allowAttachments=true', () => {
        const res = new Resource('/attachments', {
            apiRoot: hostUrl,
        });

        const attachments = [
            {
                field: 'text',
                file: testServer.expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        // This check is handled before promise is created so it should fail fast
        expect(() => {
            res.post(null, null, null, attachments);
        }).toThrow(/"allowAttachments=true" is required/);
    });

    test('attachments work', async () => {
        const res = new Resource('/attachments', {
            apiRoot: hostUrl,
            allowAttachments: true,
            headers: {
                ack: 'attachments',
            },
        });

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
                file: testServer.expectedBuffer,
                name: 'dummy.txt',
            },
        ];

        try {
            const response = await res.post(null, postData, null, attachments);

            expect(response).toEqual({
                ack: 'attachments',
                name: 'foo',
                text: {
                    name: 'dummy.txt',
                    size: testServer.expectedBuffer.length,
                },
                bool0: 'false',
                bool1: 'true',
                array: postData.array,
                object: JSON.stringify(postData.object),
            });
        } catch (e) {
            console.log('Failed with error:', e);
            fail(e);
        }
    });

    test('abort signal type is validated', async () => {
        const checkResource = () => {
            const res = new Resource('/abort', {
                apiRoot: hostUrl,
                allowAttachments: true,
                headers: {
                    ack: 'attachments',
                },
                signal: new Error('fake') as any,
            });

            expect(res.config()).toBeTruthy();
        };

        const checkRequest = async () => {
            const res = new Resource('/abort', {
                apiRoot: hostUrl,
                allowAttachments: true,
                headers: {
                    ack: 'attachments',
                },
            });

            await res.fetch(null, null, {
                signal: new Error('fake') as any,
            });
        };

        await expect(checkResource).toThrow(
            /AbortSignal is not supported at top-level/
        );
        await expect(checkRequest()).rejects.toThrow(
            /Expected signal to be an instanceof AbortSignal/
        );
    });

    test('fetch global should support request cancellation with signal', async () => {
        const controller = new AbortController();

        const prom = fetch(`${hostUrl}/abort`, { signal: controller.signal });

        setTimeout(() => {
            controller.abort();
        }, 100);

        try {
            await prom;
            throw new Error('Request should be aborted!');
        } catch (error: any) {
            // We are expecting the promise to reject with an AbortError
            expect(error).toBeInstanceOf(Error);
            expect(error).not.toBeInstanceOf(AbortError);
            expect(error.name).toEqual('AbortError');
            expect(error).toMatchObject({
                message: 'The user aborted a request.',
                type: 'aborted',
            });
        }
    });

    test('aborting raises a wrapped AbortError', async () => {
        const controller = new AbortController();

        const res = new Resource('/abort', {
            apiRoot: hostUrl,
            allowAttachments: true,
            headers: {
                ack: 'attachments',
            },
        });

        const prom = res.fetch(null, null, {
            signal: controller.signal,
        });

        setTimeout(() => {
            controller.abort();
        }, 100);

        try {
            await prom;
            throw new Error('Request should be aborted!');
        } catch (error: any) {
            // We are expecting the promise to reject with an AbortError
            expect(error).toBeInstanceOf(AbortError);
            expect(error).toMatchObject({
                isAbortError: true,
                type: 'aborted',
                name: 'AbortError',
            });
        }
    });

    test('should reject immediately if signal has already been aborted', async () => {
        const controller = new AbortController();
        controller.abort();

        const res = new Resource('/abort', {
            apiRoot: hostUrl,
            allowAttachments: true,
            headers: {
                ack: 'attachments',
            },
        });

        const prom = res.fetch(null, null, {
            signal: controller.signal,
        });

        try {
            await prom;
            throw new Error('Request should be aborted!');
        } catch (error: any) {
            // We are expecting the promise to reject with an AbortError
            expect(error).toBeInstanceOf(AbortError);
            expect(error).toMatchObject({
                isAbortError: true,
                type: 'aborted',
                name: 'AbortError',
            });
        }
    });
});
