// eslint-disable-next-line import/no-extraneous-dependencies
import { ResourceTuple } from '@tg-resources/core';
import { FetchResource } from '@tg-resources/fetch';
import { createSagaRouter } from '../src';

const api = createSagaRouter(
    {
        auth: [
            '/headers',
            { headers: () => ({ auth: 'foo' }), withCredentials: true },
        ] as ResourceTuple,
        cats: {
            apiEndpoint: '/cats',
        },
        dogs: {
            list: '/dogs/',
            details: '/dogs/${pk}',
        },
    },
    {
        apiRoot: '/api',
    },
    FetchResource
);

export function* testFetchList() {
    // $ExpectType SagaResource<SagaResource<FetchResource>>
    api.test.list;
    // $ExpectType CallEffect<any>
    api.test.list.fetch();
    // $ExpectType any
    yield api.test.list.fetch();
    // $ExpectType any
    const result: [{ id: number }] = yield api.test.list.fetch();

    // $ExpectType [{ id: number; }]
    result;
}

export function* testDetailsList() {
    // $ExpectType SagaResource<SagaResource<FetchResource>>
    api.test.details;
    // $ExpectType CallEffect<any>
    api.test.details.fetch({ id: 1 });
    // $ExpectType any
    yield api.test.details.fetch({ id: 1 });
    // $ExpectType any
    const result: { id: number } = yield api.test.details.fetch({ id: 1 });

    // $ExpectType { id: number; }
    result;
}
