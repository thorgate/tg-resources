import { isFunction } from '@tg-resources/is';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import { Attachments, ObjectMap, Query, ResourceInterface } from 'tg-resources';

import { AllowedFetchMethods, AllowedMethods, AllowedPostMethods, SagaRequestConfig } from './types';


const isPostMethod = (method: any): method is AllowedPostMethods => (
    ['post', 'patch', 'put', 'del'].includes(method)
);

export interface ResourceSagaRunnerConfig<Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any> {
    kwargs: Params | null;
    query: Query | null;
    data?: D | string | null;
    requestConfig: SagaRequestConfig | null;
    attachments?: Attachments | null;
}

export function* resourceSagaRunner<
        R = any, Params extends { [K in keyof Params]?: string } = {}, D extends ObjectMap = any
>(resource: ResourceInterface, method: AllowedMethods, options: ResourceSagaRunnerConfig<Params, D>): SagaIterator {
    const { kwargs = null, query = null, data = null, attachments = null } = options;
    let { requestConfig = null } = options;

    const config = resource.config(requestConfig);

    if (isFunction(config.mutateRequestConfig)) {
        requestConfig = yield call(config.mutateRequestConfig, requestConfig);
    }

    let callEffect;

    if (isPostMethod(method)) {
        callEffect = call<
            ResourceInterface, AllowedPostMethods,
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
    } else {
        callEffect = call<
            ResourceInterface, AllowedFetchMethods,
            Promise<R>, Params | null,
            Query | null,
            SagaRequestConfig | null>(
            [resource, method],
            kwargs,
            query,
            requestConfig,
        );
    }

    try {
        return yield callEffect;
    } catch (err) {
        if (isFunction(config.onRequestError)) {
            yield call(config.onRequestError, err);
        }

        throw err;
    }
}
