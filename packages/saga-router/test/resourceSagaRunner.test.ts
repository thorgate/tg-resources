import { FetchResource as Resource } from '@tg-resources/fetch';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { ResourceInterface } from 'tg-resources';

import { ErrorType, OnRequestError, resourceSagaRunner, ResourceSagaRunnerConfig, SagaResource } from '../src';
import { RunnerWithError } from './reduxStore';
import { addRequestConfig } from './utils';


let onRequestError: OnRequestError;

onRequestError = function* onError(error: ErrorType, resource: ResourceInterface, options: ResourceSagaRunnerConfig): SagaIterator {
    yield put({ type: 'FAILED_RESPONSE', error, endpoint: resource.apiEndpoint, options });
};


const config = {
    apiRoot: '/api',
    initializeSaga: true,
    mutateRequestConfig: addRequestConfig,
    onRequestError,
};


const fetchResource = new Resource('/test', config);

const sagaResource = new SagaResource('/test', undefined, Resource);


describe('resourceSagaRunner unit', () => {
    test('fetch :: mutateRequestConfig', async () => {
        const sagaIter = resourceSagaRunner(fetchResource, 'fetch', {});
        const testResponse: any = { testResource: 1 };

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.fetch), testResponse],
            ])
            .dispatch({ type: 'API_RESPONSE', response: testResponse })
            .run();
    });

    test('fetch :: onRequestError', async () => {
        const sagaIter = resourceSagaRunner(fetchResource, 'fetch', {});
        const error = new Error('Simulated fail');

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.fetch), throwError(error)],
            ])
            .dispatch({ type: 'FAILED_RESPONSE', error })
            .run();
    });

    test('post :: mutateRequestConfig', async () => {
        const sagaIter = resourceSagaRunner(fetchResource, 'post', {});
        const testResponse: any = { testResource: 1 };

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.post), testResponse],
            ])
            .dispatch({ type: 'API_RESPONSE', response: testResponse })
            .run();
    });

    test('post :: onRequestError', async () => {
        const sagaIter = resourceSagaRunner(fetchResource, 'post', {});
        const error = new Error('Simulated fail');

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.post), throwError(error)],
            ])
            .dispatch({ type: 'FAILED_RESPONSE', error })
            .run();
    });
});


describe('SagaResource unit', () => {
    test('fetch :: mutateRequestConfig', async () => {
        const sagaIter = sagaResource.fetch();
        const testResponse: any = { testResource: 1 };

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.fetch), testResponse],
            ])
            .dispatch({ type: 'API_RESPONSE', response: testResponse })
            .run();
    });

    test('fetch :: onRequestError', async () => {
        const sagaIter = sagaResource.fetch();
        const error = new Error('Simulated fail');

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.fetch), throwError(error)],
            ])
            .dispatch({ type: 'FAILED_RESPONSE', error })
            .run();
    });

    test('post :: mutateRequestConfig', async () => {
        const sagaIter = sagaResource.post();
        const testResponse: any = { testResource: 1 };

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.post), testResponse],
            ])
            .dispatch({ type: 'API_RESPONSE', response: testResponse })
            .run();
    });

    test('post :: onRequestError', async () => {
        const sagaIter = sagaResource.post();
        const error = new Error('Simulated fail');

        await expectSaga(RunnerWithError, sagaIter)
            .provide([
                [matchers.call.fn(fetchResource.post), throwError(error)],
            ])
            .dispatch({ type: 'FAILED_RESPONSE', error })
            .run();
    });
});
