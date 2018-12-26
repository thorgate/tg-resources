import { SagaIterator } from '@redux-saga/types';
import {
    Attachments,
    ConfigType,
    ObjectMap,
    Optional,
    OptionalMap,
    Query,
    ResourceErrorInterface,
    ResourceInterface,
    RouteConfigType,
} from 'tg-resources';


export interface SagaConfigTypeBase {
    initializeSaga: boolean;

    mutateRequestConfig?: MutatedRequestConfigFn | null;

    onRequestError?: OnRequestError | null;
}


export interface SagaRouteConfigType extends SagaConfigTypeBase, RouteConfigType {
}

export interface SagaConfigType extends SagaConfigTypeBase, ConfigType {
}

export type SagaRouteConfig = Optional<OptionalMap<SagaRouteConfigType>>;
export type SagaRequestConfig = Optional<OptionalMap<SagaConfigType>>;

export interface ResourceSagaRunnerConfig<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> {
    kwargs?: Params | null;
    query?: Query | null;
    data?: D | string | null;
    requestConfig?: SagaRequestConfig | null;
    attachments?: Attachments | null;
}

export type ErrorType = ResourceErrorInterface | Error;

export interface OnRequestError<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> {
    (error: ErrorType, resource: ResourceInterface, options: ResourceSagaRunnerConfig<Params, D>): void;
    (error: ErrorType, resource: ResourceInterface, options: ResourceSagaRunnerConfig<Params, D>): SagaIterator;
}

export type MutatedRequestConfigFn<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> = (
    requestConfig: SagaRequestConfig | undefined, resource: ResourceInterface, config: ResourceSagaRunnerConfig<Params, D>,
) => SagaIterator | SagaRequestConfig | undefined;
