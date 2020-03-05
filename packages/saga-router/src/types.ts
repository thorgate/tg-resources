import { SagaIterator } from '@redux-saga/types';
import {
    ConfigType,
    ResourceErrorInterface,
    ResourceInterface,
    RouteConfigType,
} from '@tg-resources/core';
import {
    Attachments,
    Kwargs,
    ObjectMap,
    Optional,
    Query,
} from '@tg-resources/types';

export interface SagaConfigTypeBase {
    initializeSaga: boolean;

    mutateRequestConfig?: MutatedRequestConfigFn | null;

    onRequestError?: OnRequestError | null;
}

export interface SagaRouteConfigType
    extends SagaConfigTypeBase,
        RouteConfigType {}

export interface SagaConfigType extends SagaConfigTypeBase, ConfigType {}

export type SagaRouteConfig = Optional<Partial<SagaRouteConfigType>>;
export type SagaRequestConfig = Optional<Partial<SagaConfigType>>;

export interface ResourceSagaRunnerConfig<
    Params extends Kwargs<Params> = {},
    D extends ObjectMap = any
> {
    kwargs?: Params | null;
    query?: Query | null;
    data?: D | string | null;
    requestConfig?: SagaRequestConfig | null;
    attachments?: Attachments | null;
}

export type ErrorType = ResourceErrorInterface | Error;

export type OnRequestError<
    Params extends Kwargs<Params> = {},
    D extends ObjectMap = any
> = (
    error: ErrorType,
    resource: ResourceInterface,
    options: ResourceSagaRunnerConfig<Params, D>
) => void | SagaIterator;

export type MutatedRequestConfigFn<
    Params extends Kwargs<Params> = {},
    D extends ObjectMap = any
> = (
    requestConfig: SagaRequestConfig | undefined,
    resource: ResourceInterface,
    config: ResourceSagaRunnerConfig<Params, D>
) => SagaIterator | SagaRequestConfig | undefined;
