import { SagaIterator } from 'redux-saga';
import { Func1 } from 'redux-saga/effects';
import { ConfigType, Optional, OptionalMap } from 'tg-resources';


export type AllowedFetchMethods = 'fetch' | 'head' | 'options';

export type AllowedPostMethods = 'post' | 'patch' | 'put' | 'del';

export type AllowedMethods = AllowedFetchMethods | AllowedPostMethods;


export interface SagaConfigType extends ConfigType {
    initializeSaga: boolean;

    mutateRequestConfig: MutatedRequestConfigFn;

    onRequestError: OnRequestError;
}


export type SagaRequestConfig = Optional<OptionalMap<SagaConfigType>>;

export type OnRequestErrorFn = (error?: any) => void;
export type OnRequestErrorSaga = (error?: any) => SagaIterator;
export type OnRequestError = OnRequestErrorFn | OnRequestErrorSaga;

export type MutatedRequestConfigFn = Func1<SagaIterator | SagaRequestConfig | undefined, SagaRequestConfig | undefined>;
