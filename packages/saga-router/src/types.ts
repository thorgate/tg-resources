import { SagaIterator } from 'redux-saga';
import { Func1 } from 'redux-saga/effects';
import { ConfigType, Optional, OptionalMap } from 'tg-resources';


export interface SagaConfigType extends ConfigType {
    initializeSaga: boolean;

    mutateRequestConfig: MutatedRequestConfigFn;

    onRequestError: OnRequestError;
}


export type SagaRequestConfig = Optional<OptionalMap<SagaConfigType>>;

export type OnRequestError = (error?: any) => void;

export type MutatedRequestConfigFn = Func1<SagaIterator | SagaRequestConfig | undefined, SagaRequestConfig | undefined>;
