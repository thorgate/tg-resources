import { isFunction } from '@tg-resources/is';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Attachments, ObjectMap, Query, Resource, ResourceInterface, RouterInterface } from 'tg-resources';

import { SagaConfigType, SagaRequestConfig } from './types';


export class SagaResource<Klass extends ResourceInterface> extends Resource {
    public constructor(
        apiEndpoint: string,
        resourceKlass: { new(apiEndpoint: string, config: SagaRequestConfig): Klass },
        config: SagaRequestConfig = null,
    ) {
        super(apiEndpoint, config);
        this._resource = new resourceKlass(apiEndpoint, config);
    }

    private readonly _resource: Klass;

    /* istanbul ignore next: not in use directly */
    public get apiEndpoint() {
        return this._resource.apiEndpoint;
    }

    /* istanbul ignore next: not in use directly */
    public get parent() {
        return this._resource.parent;
    }

    /**
     * Internal API. Not for public usage.
     * @param parent
     * @private
     */
    public setParent(parent: RouterInterface) {
        this._resource.setParent(parent);
    }

    public get isBound() {
        return this._resource.isBound;
    }

    /* istanbul ignore next: not in use directly */
    public getHeaders() {
        return this._resource.getHeaders();
    }

    /* istanbul ignore next: not in use directly */
    public getCookies() {
        return this._resource.getCookies();
    }

    /* istanbul ignore next: not in use directly */
    public getConfig() {
        return this._resource.getConfig();
    }

    /* istanbul ignore next: not in use directly */
    public config(requestConfig?: SagaRequestConfig) {
        return this._resource.config(requestConfig) as SagaConfigType;
    }

    /* istanbul ignore next: not in use directly */
    public setConfig(config: SagaRequestConfig) {
        this._resource.setConfig(config);
    }

    /* istanbul ignore next: not in use directly */
    public clearConfigCache() {
        this._resource.clearConfigCache();
    }

    /* Public API */
    public fetch = <
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: SagaRequestConfig | null) => {
        return this._sagaFetch<R, Params | null | undefined>(
            this._resource.fetch, kwargs, query, requestConfig,
        );
    };

    public head = <
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: SagaRequestConfig | null) => {
        return this._sagaFetch<R, Params | null | undefined>(
            this._resource.head, kwargs, query, requestConfig,
        );
    };

    public options = <
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: SagaRequestConfig | null) => {
        return this._sagaFetch<R, Params | null | undefined>(
            this._resource.options, kwargs, query, requestConfig,
        );
    };

    public post = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>(
            this._resource.post, kwargs, data, query, attachments, requestConfig,
        );
    };

    public patch = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>(
            this._resource.patch, kwargs, data, query, attachments, requestConfig,
        );
    };

    public put = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>(
            this._resource.put, kwargs, data, query, attachments, requestConfig,
        );
    };

    public del = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>(
            this._resource.del, kwargs, data, query, attachments, requestConfig,
        );
    };

    protected _sagaFetch<
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(method: any, kwargs?: Params | null, query?: Query | null, requestConfig?: SagaRequestConfig | null) {
        const mutateRequestConfig = this.config(requestConfig).mutateRequestConfig;
        const onRequestError = this.config(requestConfig).onRequestError;

        function* runner(): SagaIterator {
            let config = requestConfig;

            if (mutateRequestConfig) {
                config = yield call(mutateRequestConfig, requestConfig);
            }

            try {
                return yield call<
                    Promise<R>, Params | null | undefined,
                    Query | null | undefined,
                    SagaRequestConfig | null | undefined>(
                    method,
                    kwargs,
                    query,
                    config,
                );
            } catch (err) {
                if (isFunction(onRequestError)) {
                    onRequestError(err);
                }

                throw err;
            }
        }

        if (this.config(requestConfig).initializeSaga) {
            return runner();
        }

        return runner;
    }

    protected _sagaPost<
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        method: any, kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) {
        const mutateRequestConfig = this.config(requestConfig).mutateRequestConfig;
        const onRequestError = this.config(requestConfig).onRequestError;

        function* runner(): SagaIterator {
            let config = requestConfig;

            if (mutateRequestConfig) {
                config = yield call(mutateRequestConfig, requestConfig);
            }

            try {
                return yield call<
                    Promise<R>,
                    Params | null | undefined,
                    D | string | null | undefined,
                    Query | null | undefined,
                    Attachments | null | undefined,
                    SagaRequestConfig | null | undefined>(
                    method,
                    kwargs,
                    data,
                    query,
                    attachments,
                    config,
                );
            } catch (err) {
                if (isFunction(onRequestError)) {
                    onRequestError(err);
                }

                throw err;
            }
        }

        if (this.config(requestConfig).initializeSaga) {
            return runner();
        }

        return runner;
    }

    /* istanbul ignore next: not in use directly */
    protected createRequest<
        D extends ObjectMap = any
    >(method: string, url: string, query: Query, data: D | null, attachments: Attachments, requestConfig: SagaRequestConfig): any {
        return this._resource.createRequest(method, url, query, data, attachments, requestConfig);
    }

    /* istanbul ignore next: not in use directly */
    protected doRequest(req: any, resolve: (response: any, error: any) => void): void {
        return this._resource.doRequest(req, resolve);
    }

    /* istanbul ignore next: not in use directly */
    protected setHeader(req: any, key: string, value: string | null): any {
        return this._resource.setHeader(req, key, value);
    }

    /* istanbul ignore next: not in use directly */
    protected wrapResponse(res: any, error: any, req?: any) {
        return this._resource.wrapResponse(res, error, req);
    }
}
