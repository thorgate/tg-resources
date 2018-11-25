import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware, { Effect, SagaIterator, Task } from 'redux-saga';
import { putResolve } from 'redux-saga/effects';


export interface State {
    [api: string]: any;
}

const initialState: State = {};


interface ApiResponseAction {
    type: 'API_RESPONSE';
    response: any;
}

const setResponse = (response: any): ApiResponseAction => ({
    type: 'API_RESPONSE',
    response,
});

function reducer(state: State = initialState, action: ApiResponseAction) {
    switch (action.type) {
        case 'API_RESPONSE':
            return action.response;

        default:
            return state;
    }
}


type RunSagaEffect = (sagaEffect: any) => Task;


type ExtendedStore<S, T> = S & {
    [P in keyof T]: T[P]
};


export function* SagaRunner(saga: Effect): SagaIterator {
    const response = yield saga;
    yield putResolve(setResponse(response));
}

export function* SagaInitialized(saga: any): SagaIterator {
    const response = yield* saga;
    yield putResolve(setResponse(response));
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
        applyMiddleware(sagaMiddleware)
    );

    (store as any).runSaga = runSaga;
    (store as any).runSagaInitialized = runSagaInitialized;

    return store as ExtendedStore<typeof store, {
        runSaga: RunSagaEffect;
        runSagaInitialized: RunSagaEffect;
    }>;
}
