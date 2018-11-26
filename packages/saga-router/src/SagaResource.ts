import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Attachments, ObjectMap, Query, Resource, ResourceInterface, RouterInterface } from 'tg-resources';

import { resourceSagaRunner, ResourceSagaRunnerConfig } from './resourceSagaRunner';
import { AllowedFetchMethods, AllowedPostMethods, SagaConfigType, SagaRequestConfig } from './types';


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

    public get resource(): Klass {
        return this._resource;
    }

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

    public config(requestConfig?: SagaRequestConfig): SagaConfigType {
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
        return this._sagaFetch<R, Params | null | undefined>('fetch', kwargs, query, requestConfig);
    };

    public head = <
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: SagaRequestConfig | null) => {
        return this._sagaFetch<R, Params | null | undefined>('head', kwargs, query, requestConfig);
    };

    public options = <
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: SagaRequestConfig | null) => {
        return this._sagaFetch<R, Params | null | undefined>('options', kwargs, query, requestConfig);
    };

    public post = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>('post', kwargs, data, query, attachments, requestConfig);
    };

    public patch = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>('patch', kwargs, data, query, attachments, requestConfig);
    };

    public put = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>('put', kwargs, data, query, attachments, requestConfig);
    };

    public del = <
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, requestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<R, D, Params>('del', kwargs, data, query, attachments, requestConfig);
    };

    protected _sagaFetch<
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        method: AllowedFetchMethods, kwargs: Params | null = null, query: Query | null = null,
        requestConfig: SagaRequestConfig | null = null
    ) {
        if (this.config(requestConfig).initializeSaga) {
            return resourceSagaRunner<R, Params>(this.resource, method, {
                kwargs,
                query,
                requestConfig,
            });
        }

        return call<
            SagaIterator,
            Klass,
            AllowedFetchMethods,
            ResourceSagaRunnerConfig<Params, R>>(
            resourceSagaRunner,
            this.resource,
            method,
            {
                kwargs,
                query,
                requestConfig,
            },
        );
    }

    protected _sagaPost<
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        method: AllowedPostMethods, kwargs: Params | null = null, data: D | string | null = null, query: Query | null = null,
        attachments: Attachments | null = null, requestConfig: SagaRequestConfig | null = null
    ) {
        if (this.config(requestConfig).initializeSaga) {
            return resourceSagaRunner<R, Params>(this.resource, method, {
                kwargs,
                data,
                query,
                attachments,
                requestConfig,
            });
        }

        return call<
            SagaIterator,
            Klass,
            AllowedPostMethods,
            ResourceSagaRunnerConfig<Params, D>>(
            resourceSagaRunner,
            this.resource,
            method,
            {
                kwargs,
                data,
                query,
                attachments,
                requestConfig,
            },
        );
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
