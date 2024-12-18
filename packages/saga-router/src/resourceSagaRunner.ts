import {
    isFetchMethod,
    isPostMethod,
    Kwargs,
    ObjectMap,
    ResourceInterface,
} from '@tg-resources/core';
import { isFunction } from '@tg-resources/is';
import { SagaIterator } from 'redux-saga';
import { call, cancelled } from 'redux-saga/effects';

import { ResourceSagaRunnerConfig, SagaConfigType } from './types';

export function* resourceSagaRunner<
    Params extends Kwargs | null = Kwargs,
    TPayload extends ObjectMap | string | null = any
>(
    resource: ResourceInterface,
    method: string,
    options: ResourceSagaRunnerConfig<Params, TPayload> = {}
): SagaIterator {
    const {
        kwargs = null,
        query = null,
        data = null,
        attachments = null,
    } = options;

    let { requestConfig = null } = options;

    const config = resource.config(requestConfig) as SagaConfigType;
    const { mutateSagaRequestConfig, onSagaRequestError } = config;

    if (isFunction(mutateSagaRequestConfig)) {
        requestConfig = yield call(
            mutateSagaRequestConfig,
            requestConfig,
            resource,
            options
        );
    }

    let controller: AbortController | null = null;
    if (!(requestConfig && requestConfig.signal)) {
        controller = new AbortController();

        requestConfig = {
            ...(requestConfig || {}),

            signal: controller.signal,
        };
    }

    let callEffect;

    if (isFetchMethod(method)) {
        callEffect = call([resource, method], kwargs, query, requestConfig);
    } else if (isPostMethod(method)) {
        callEffect = call(
            [resource, method],
            kwargs,
            data,
            query,
            attachments,
            requestConfig
        );
    } else {
        throw new Error('Unknown resource method used.');
    }

    try {
        return yield callEffect;
    } catch (err) {
        if (isFunction(onSagaRequestError)) {
            yield call(onSagaRequestError, err as any, resource, options);
        }

        throw err;
    } finally {
        const isCancelled = yield cancelled();

        // If current task is cancelled AND no signal is provided, trigger controller.abort
        if (isCancelled && controller) {
            controller.abort();
        }
    }
}
