import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import { ErrorType, NetworkError, ResourceInterface } from '@tg-resources/core';
import { FetchResource as Resource } from '@tg-resources/fetch';
import { getError } from '@tg-resources/test-utils';
import { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import {
    OnRequestError,
    resourceSagaRunner,
    ResourceSagaRunnerConfig,
    SagaRequestConfig,
    SagaResource,
} from '../src';

import { configureStore, RunnerWithError, setError } from './reduxStore';
import { addRequestConfig } from './utils';

const onSagaRequestError: OnRequestError = function* onError(
    error: ErrorType,
    resource: ResourceInterface,
    options: ResourceSagaRunnerConfig
): SagaIterator {
    yield put(setError(error, resource.apiEndpoint, options));
};

const config: SagaRequestConfig = {
    apiRoot: '/api',
    mutateSagaRequestConfig: addRequestConfig,
    onSagaRequestError,
};

type DataOrError = { data: any } | { error: any };

const createResource = (dataOrError: DataOrError) => {
    const resource = new Resource('/resource-test', config);

    const resourceGetMock = jest.spyOn(resource, 'get');
    const resourcePostMock = jest.spyOn(resource, 'post');

    if ('data' in dataOrError) {
        resourceGetMock.mockResolvedValue(dataOrError.data);
        resourcePostMock.mockResolvedValue(dataOrError.data);
    } else {
        resourceGetMock.mockRejectedValue(new NetworkError(dataOrError.error));
        resourcePostMock.mockRejectedValue(new NetworkError(dataOrError.error));
    }

    return resource;
};

const createSagaResource = (dataOrError: DataOrError) => {
    const resource = new SagaResource('/saga-resource-test', config, Resource);

    const resourceGetMock = jest.spyOn(resource.resource, 'get');
    const resourcePostMock = jest.spyOn(resource.resource, 'post');

    if ('data' in dataOrError) {
        resourceGetMock.mockResolvedValue(dataOrError.data);
        resourcePostMock.mockResolvedValue(dataOrError.data);
    } else {
        resourceGetMock.mockRejectedValue(new NetworkError(dataOrError.error));
        resourcePostMock.mockRejectedValue(new NetworkError(dataOrError.error));
    }

    return resource;
};

let store: ReturnType<typeof configureStore>;

beforeEach(() => {
    store = configureStore();
});

const expectResponse = async (data: any, sagaIter: any) => {
    await store.sagaMiddleware.run(RunnerWithError, sagaIter).toPromise();
    expect(store.getState()).toEqual(data);
};

const expectError = async (
    apiEndpoint: string,
    error: any,
    sagaIter: any,
    options: any = {}
) => {
    await store.sagaMiddleware.run(RunnerWithError, sagaIter).toPromise();

    expect(store.getState()).toEqual({
        failed: true,
        endpoint: apiEndpoint,
        error: new NetworkError(error),
        options,
    });
};

describe('resourceSagaRunner unit :: Resource', () => {
    test('unknown method', async () => {
        const resource = createResource({ data: null });
        const sagaIter = resourceSagaRunner(resource as any, 'unknown');

        const error = await getError(() =>
            store.runSagaInitialized(sagaIter).toPromise()
        );

        expect(`${error}`).toEqual('Error: Unknown resource method used.');
    });

    test('fetch :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createResource({ data });
        const sagaIter = resourceSagaRunner(resource as any, 'fetch');
        await expectResponse(data, sagaIter);
    });

    test('fetch :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createResource({ error });
        const sagaIter = resourceSagaRunner(resource as any, 'fetch', {});
        await expectError(resource.apiEndpoint, error, sagaIter);
    });

    test('post :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createResource({ data });
        const sagaIter = resourceSagaRunner(resource as any, 'post');
        await expectResponse(data, sagaIter);
    });

    test('post :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createResource({ error });
        const sagaIter = resourceSagaRunner(resource as any, 'post', {});
        await expectError(resource.apiEndpoint, error, sagaIter);
    });
});

describe('resourceSagaRunner unit :: SagaResource', () => {
    test('fetch :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createSagaResource({ data });
        const sagaIter = resource.fetchEffect();
        await expectResponse(data, sagaIter);
    });

    test('fetch :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createSagaResource({ error });
        const sagaIter = resource.fetchEffect();
        await expectError(resource.apiEndpoint, error, sagaIter, {
            kwargs: null,
            query: null,
            requestConfig: null,
        });
    });

    test('post :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createSagaResource({ data });
        const sagaIter = resource.postEffect();
        await expectResponse(data, sagaIter);
    });

    test('post :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createSagaResource({ error });
        const sagaIter = resource.postEffect();
        await expectError(resource.apiEndpoint, error, sagaIter, {
            kwargs: null,
            data: null,
            query: null,
            attachments: null,
            requestConfig: null,
        });
    });
});
