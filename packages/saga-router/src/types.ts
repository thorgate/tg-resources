import { SagaIterator } from '@redux-saga/types';
import {
    Attachments,
    ConfigType,
    ErrorType,
    Kwargs,
    ObjectMap,
    Optional,
    OptionalMap,
    Query,
    ResourceInterface,
    RouteConfigType,
} from '@tg-resources/core';

export type SagaResourceFetchMethods =
    | 'getEffect'
    | 'fetchEffect'
    | 'headEffect'
    | 'optionsEffect';

export type SagaResourcePostMethods =
    | 'postEffect'
    | 'patchEffect'
    | 'putEffect'
    | 'delEffect';

export interface SagaConfigTypeBase {
    mutateSagaRequestConfig?: MutatedRequestConfigFn<any> | null;

    onSagaRequestError?: OnRequestError<any> | null;
}

export interface SagaRouteConfigType
    extends SagaConfigTypeBase,
        RouteConfigType {}

export interface SagaConfigType extends SagaConfigTypeBase, ConfigType {}

export type SagaRouteConfig = Optional<OptionalMap<SagaRouteConfigType>>;
export type SagaRequestConfig = Optional<OptionalMap<SagaConfigType>>;

export interface ResourceSagaRunnerConfig<
    Params extends Kwargs | null = Kwargs,
    TPayload extends ObjectMap | string | null = any
> {
    kwargs?: Params | null;
    query?: Query | null;
    data?: TPayload | string | null;
    requestConfig?: SagaRequestConfig | null;
    attachments?: Attachments | null;
}

export type OnRequestError<
    Params extends Kwargs | null = Kwargs,
    TPayload extends ObjectMap | string | null = any
> = (
    error: ErrorType,
    resource: ResourceInterface,
    options: ResourceSagaRunnerConfig<Params, TPayload>
) => void | SagaIterator;

export type MutatedRequestConfigFn<
    Params extends Kwargs = Kwargs,
    TPayload extends ObjectMap = any
> = (
    requestConfig: SagaRequestConfig | undefined,
    resource: ResourceInterface,
    config: ResourceSagaRunnerConfig<Params, TPayload>
) => SagaIterator | SagaRequestConfig | undefined;
