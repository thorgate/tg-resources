import { isFunction } from '@tg-resources/is';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import {
    Attachments,
    isFetchMethod,
    ObjectMap,
    Query,
    ResourceFetchMethods,
    ResourceInterface,
    ResourceMethods,
    ResourcePostMethods
} from 'tg-resources';

import { ResourceSagaRunnerConfig, SagaConfigType, SagaRequestConfig } from './types';


export function* resourceSagaRunner<
    R = any, Params extends { [K in keyof Params]?: string } = {},
    D extends ObjectMap = any
>(resource: ResourceInterface, method: ResourceMethods, options: ResourceSagaRunnerConfig<Params, D> = {}): SagaIterator {
    const {
        kwargs = null,
        query = null,
        data = null,
        attachments = null,
    } = options;

    let { requestConfig = null } = options;

    const config = resource.config(requestConfig) as SagaConfigType;

    if (isFunction(config.mutateRequestConfig)) {
        requestConfig = yield call(config.mutateRequestConfig, requestConfig, resource, options);
    }

    let callEffect;

    if (isFetchMethod(method)) {
        callEffect = call<
            ResourceInterface,
            ResourceFetchMethods,
            Promise<R>, Params | null,
            Query | null,
            SagaRequestConfig | null>(
            [resource, method],
            kwargs,
            query,
            requestConfig,
        );
    } else {
        callEffect = call<
            ResourceInterface,
            ResourcePostMethods,
            Promise<R>,
            Params | null,
            D | string | null,
            Query | null,
            Attachments | null,
            SagaRequestConfig | null>(
            [resource, method],
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
        );
    }

    try {
        return yield callEffect;
    } catch (err) {
        if (isFunction(config.onRequestError)) {
            yield call(config.onRequestError, err, resource, options);
        }

        throw err;
    }
}
