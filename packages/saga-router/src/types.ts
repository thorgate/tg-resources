import { SagaIterator } from 'redux-saga';
import { Func3 } from 'redux-saga/effects';
import {
    Attachments,
    ConfigType,
    ObjectMap,
    Optional,
    OptionalMap,
    Query,
    ResourceErrorInterface,
    ResourceInterface
} from 'tg-resources';


export interface ResourceSagaRunnerConfig<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> {
    kwargs?: Params | null;
    query?: Query | null;
    data?: D | string | null;
    requestConfig?: SagaRequestConfig | null;
    attachments?: Attachments | null;
}


export interface SagaConfigType extends ConfigType {
    initializeSaga: boolean;

    mutateRequestConfig: MutatedRequestConfigFn;

    onRequestError: OnRequestError;
}

export type ErrorType = ResourceErrorInterface | Error;

export type SagaRequestConfig = Optional<OptionalMap<SagaConfigType>>;

export interface OnRequestError<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> {
    (error: ErrorType, resource: ResourceInterface, options: ResourceSagaRunnerConfig<Params, D>): void;
    (error: ErrorType, resource: ResourceInterface, options: ResourceSagaRunnerConfig<Params, D>): SagaIterator;
}

export type MutatedRequestConfigFn<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> = Func3<
    SagaIterator | SagaRequestConfig | undefined, SagaRequestConfig | undefined, ResourceInterface, ResourceSagaRunnerConfig<Params, D>
>;
