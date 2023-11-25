import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { ErrorType, NetworkError, ResourceInterface } from 'tg-resources';

import {
    OnRequestError,
    resourceSagaRunner,
    ResourceSagaRunnerConfig,
    SagaResource,
} from '../src';
import { DummyResource as Resource } from './DummyResource';
import { configureStore, RunnerWithError, setError } from './reduxStore';
import { addRequestConfig } from './utils';

let onRequestError: OnRequestError;

onRequestError = function* onError(
    error: ErrorType,
    resource: ResourceInterface,
    options: ResourceSagaRunnerConfig
): SagaIterator {
    yield put(setError(error, resource.apiEndpoint, options));
};

const config = {
    apiRoot: '/api',
    mutateRequestConfig: addRequestConfig,
    onRequestError,
};

const createResource = (data?: any, error?: any) => {
    const resource = new Resource('/resource-test', config);
    resource.Data = data;
    resource.Error = error;
    return resource;
};

const createSagaResource = (data?: any, error?: any) => {
    const resource = new SagaResource('/saga-resource-test', config, Resource);
    resource.resource.Data = data;
    resource.resource.Error = error;
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
        try {
            const resource = createResource(null, null);
            const sagaIter = resourceSagaRunner(resource, 'unknown');
            await store.runSagaInitialized(sagaIter).toPromise();

            throw new Error('Expected to throw for unknown method');
        } catch (error) {
            expect(`${error}`).toEqual('Error: Unknown resource method used.');
        }
    });

    test('fetch :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createResource(data);
        const sagaIter = resourceSagaRunner(resource, 'fetch');
        await expectResponse(data, sagaIter);
    });

    test('fetch :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createResource(undefined, error);
        const sagaIter = resourceSagaRunner(resource, 'fetch', {});
        await expectError(resource.apiEndpoint, error, sagaIter);
    });

    test('post :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createResource(data);
        const sagaIter = resourceSagaRunner(resource, 'post');
        await expectResponse(data, sagaIter);
    });

    test('post :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createResource(undefined, error);
        const sagaIter = resourceSagaRunner(resource, 'post', {});
        await expectError(resource.apiEndpoint, error, sagaIter);
    });
});

describe('resourceSagaRunner unit :: SagaResource', () => {
    test('fetch :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createSagaResource(data);
        const sagaIter = resource.fetch();
        await expectResponse(data, sagaIter);
    });

    test('fetch :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createSagaResource(undefined, error);
        const sagaIter = resource.fetch();
        await expectError(resource.apiEndpoint, error, sagaIter, {
            kwargs: null,
            query: null,
            requestConfig: null,
        });
    });

    test('post :: mutateRequestConfig', async () => {
        const data = { testResource: 1 };
        const resource = createSagaResource(data);
        const sagaIter = resource.post();
        await expectResponse(data, sagaIter);
    });

    test('post :: onRequestError', async () => {
        const error = new Error('Simulated fail');
        const resource = createSagaResource(undefined, error);
        const sagaIter = resource.post();
        await expectError(resource.apiEndpoint, error, sagaIter, {
            kwargs: null,
            data: null,
            query: null,
            attachments: null,
            requestConfig: null,
        });
    });
});
