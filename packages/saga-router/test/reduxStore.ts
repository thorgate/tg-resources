import { Effect, SagaIterator, Task } from '@redux-saga/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import { putResolve } from 'redux-saga/effects';

import { ResourceSagaRunnerConfig } from '../src';

export interface State {
    [api: string]: any;
}

const initialState: State = {};

interface ApiResponseAction {
    type: 'API_RESPONSE';
    response: any;
}

interface ApiErrorAction {
    type: 'FAILED_RESPONSE';
    error: any;
    endpoint: string;
    options: ResourceSagaRunnerConfig;
}

const setResponse = (response: any): ApiResponseAction => ({
    type: 'API_RESPONSE',
    response,
});

export const setError = (
    error: any,
    endpoint: string,
    options: ResourceSagaRunnerConfig
): ApiErrorAction => ({
    type: 'FAILED_RESPONSE',
    error,
    endpoint,
    options,
});

function reducer(
    state: State | undefined,
    action: ApiResponseAction | ApiErrorAction
) {
    switch (action.type) {
        case 'API_RESPONSE':
            return action.response;

        case 'FAILED_RESPONSE':
            return {
                failed: true,
                error: action.error,
                endpoint: action.endpoint,
                options: action.options,
            };

        default:
            return state;
    }
}

type RunSagaEffect = (sagaEffect: any) => Task;

type ExtendedStore<S, T> = S & {
    [P in keyof T]: T[P];
};

export function* SagaRunner(saga: Effect): SagaIterator {
    const response = yield saga;
    yield putResolve(setResponse(response));
}

export function* SagaInitialized(saga: any): SagaIterator {
    const response = yield* saga;
    yield putResolve(setResponse(response));
}

export function* RunnerWithError(saga: Effect): SagaIterator {
    try {
        const response = yield saga;
        yield putResolve(setResponse(response));
    } catch (err) {
        yield putResolve({ type: 'FAILED_API_RESPONSE', error: err });
    }
}

export function configureStore() {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    function runSaga(saga: Effect): Task {
        return sagaMiddleware.run(SagaRunner, saga);
    }

    function runSagaInitialized(saga: any): Task {
        return sagaMiddleware.run(SagaInitialized, saga);
    }

    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(sagaMiddleware)
    );

    (store as any).runSaga = runSaga;
    (store as any).runSagaInitialized = runSagaInitialized;
    (store as any).sagaMiddleware = sagaMiddleware;

    return store as ExtendedStore<
        typeof store,
        {
            runSaga: RunSagaEffect;
            runSagaInitialized: RunSagaEffect;
            sagaMiddleware: SagaMiddleware;
        }
    >;
}
