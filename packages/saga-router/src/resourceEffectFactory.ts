import {
    isFetchMethod,
    isPostMethod,
    Kwargs,
    ObjectMap,
    RequestConfig,
    Resource,
} from '@tg-resources/core';
import { call } from 'redux-saga/effects';

import { resourceSagaRunner } from './resourceSagaRunner';
import { isSagaResource, SagaResource } from './SagaResource';
import { ResourceSagaRunnerConfig, SagaRequestConfig } from './types';
import { isSagaFetchMethod, isSagaPostMethod } from './utils';

export interface EffectCreatorOptions<
    Params extends Kwargs | null = Kwargs,
    TPayload extends ObjectMap | string | null = any
> extends ResourceSagaRunnerConfig<Params, TPayload> {
    requestConfig?: RequestConfig | SagaRequestConfig | null;
}

/**
 * Create Redux-Saga effect for Resource or SagaResource.
 *  This useful for library authors to simpler interface either of the resources.
 *
 * @param resource SagaResource or Resource backend class
 * @param method Valid resource fetch or post like method name.
 * @param options Resource method parameters
 */
export const resourceEffectFactory = <
    Klass extends Resource,
    Params extends Kwargs | null = Kwargs,
    TPayload extends ObjectMap | string | null = any
>(
    resource: Klass | SagaResource<Klass>,
    method: string,
    options: EffectCreatorOptions<Params, TPayload> = {}
) => {
    if (isSagaResource(resource)) {
        if (isSagaFetchMethod(method)) {
            const resourceMethod = resource[method];

            return resourceMethod(
                options.kwargs,
                options.query,
                options.requestConfig
            );
        }

        if (isSagaPostMethod(method)) {
            const resourceMethod = resource[method];

            return resourceMethod(
                options.kwargs,
                options.data,
                options.query,
                options.attachments,
                options.requestConfig
            );
        }
    }

    if (isFetchMethod(method)) {
        return call(resourceSagaRunner, resource, method, options);
    }

    if (isPostMethod(method)) {
        return call(resourceSagaRunner, resource, method, options);
    }

    throw new Error('Unknown method used');
};
