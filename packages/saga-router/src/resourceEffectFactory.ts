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

export interface EffectCreatorOptions<
    Params extends Kwargs<Params> = {},
    D extends ObjectMap = any
> extends ResourceSagaRunnerConfig<Params, D> {
    requestConfig?: RequestConfig | SagaRequestConfig | null;
}

/**
 * Create Redux-Saga effect for Resource or SagaResource.
 *  This useful for library authors to simpler interface either of the resources.
 *  This does not work with {@link SagaConfigType.initializeSaga} enabled.
 *
 * @param resource SagaResource or Resource backend class
 * @param method Valid resource fetch or post like method name.
 * @param options Resource method parameters
 */
export const resourceEffectFactory = <
    Klass extends Resource,
    Params extends Kwargs<Params> = {},
    D extends ObjectMap = any
>(
    resource: Klass | SagaResource<Klass>,
    method: string,
    options: EffectCreatorOptions<Params, D> = {}
) => {
    if (isSagaResource(resource)) {
        if (resource.config(options.requestConfig).initializeSaga) {
            throw new Error(
                'Misconfiguration: InitializeSaga is not supported'
            );
        }

        if (isFetchMethod(method)) {
            return resource[method](
                options.kwargs,
                options.query,
                options.requestConfig
            );
        } else if (isPostMethod(method)) {
            return resource[method](
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
