import {
    Attachments,
    Kwargs,
    ObjectMap,
    Query,
    RequestConfig,
    Resource,
    ResourceFetchMethods,
    ResourcePostMethods,
    RouteConfig,
    RouterInterface,
} from '@tg-resources/core';
import { call, CallEffect } from 'redux-saga/effects';

import { DEFAULT_CONFIG } from './constants';
import { resourceSagaRunner } from './resourceSagaRunner';
import {
    ResourceSagaRunnerConfig,
    SagaConfigType,
    SagaRequestConfig,
    SagaRouteConfig,
} from './types';

export function isSagaResource<Klass extends Resource>(
    obj: any
): obj is SagaResource<Klass> {
    return (
        obj instanceof Resource &&
        'resource' in obj &&
        typeof (obj as any).resource !== 'undefined' &&
        typeof (obj as any).resource === 'object'
    );
}

export class SagaResource<
    Klass extends Resource<any, any, any, any>,
    Params extends Kwargs | null = Kwargs,
    TFetchResponse = any,
    TPostPayload extends ObjectMap | string | null = any,
    TPostResponse = TFetchResponse
> extends Resource<Params, TFetchResponse, TPostPayload, TPostResponse> {
    public constructor(
        apiEndpoint: string,
        config: SagaRouteConfig,
        ResourceKlass: new (endpoint: string, cfg?: RouteConfig) => Klass
    ) {
        super(apiEndpoint, config as Pick<typeof config, keyof RouteConfig>);
        this._resource = new ResourceKlass(
            apiEndpoint,
            config as Pick<typeof config, keyof RouteConfig>
        );
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
     * @param routeName
     * @private
     */
    public setParent(parent: RouterInterface, routeName: string) {
        this._resource.setParent(parent, routeName);
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
        return {
            ...DEFAULT_CONFIG,
            ...this._resource.config(requestConfig),
        } as SagaConfigType;
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
    public get = <TResponse = TFetchResponse, TParams extends Params = Params>(
        kwargs?: TParams | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResponse> =>
        this.resource.get<TResponse, TParams>(kwargs, query, requestConfig);

    public getEffect = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs?: Params | null,
        query?: Query | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ): CallEffect<TResponse> =>
        this._sagaFetch<TResponse, TParams>(
            'get',
            kwargs as TParams,
            query,
            sagaRequestConfig
        );

    public fetch = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResponse> =>
        this.get<TResponse, TParams>(kwargs, query, requestConfig);

    public fetchEffect = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs?: Params | null,
        query?: Query | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ): CallEffect<TResponse> =>
        this.getEffect<TResponse, TParams>(kwargs, query, sagaRequestConfig);

    public head = <
        TResponse = Record<string, never>,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ) => this.resource.head<TResponse, TParams>(kwargs, query, requestConfig);

    public headEffect = <
        TResponse = Record<string, never>,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        query?: Query | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this._sagaFetch<TResponse, TParams>(
            'head',
            kwargs,
            query,
            sagaRequestConfig
        );

    public options = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ) => this.resource.head<TResponse, TParams>(kwargs, query, requestConfig);

    public optionsEffect = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        query?: Query | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this._sagaFetch<TResponse, TParams>(
            'options',
            kwargs,
            query,
            sagaRequestConfig
        );

    public post = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ) =>
        this.resource.post<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig
        );

    public postEffect = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this._sagaPost<TResponse, TPayload, TParams>(
            'post',
            kwargs,
            data,
            query,
            attachments,
            sagaRequestConfig
        );

    public patch = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ) =>
        this.resource.patch<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig
        );

    public patchEffect = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this._sagaPost<TResponse, TPayload, TParams>(
            'patch',
            kwargs,
            data,
            query,
            attachments,
            sagaRequestConfig
        );

    public put = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ) =>
        this.resource.put<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig
        );

    public putEffect = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this._sagaPost<TResponse, TPayload, TParams>(
            'put',
            kwargs,
            data,
            query,
            attachments,
            sagaRequestConfig
        );

    public delete = <
        TResponse = Record<string, never>,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ) =>
        this.resource.delete<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig
        );

    public del = <
        TResponse = Record<string, never>,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ) =>
        this.delete<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig
        );

    public deleteEffect = <
        TResponse = Record<string, never>,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this._sagaPost<TResponse, TPayload, TParams>(
            'delete',
            kwargs,
            data,
            query,
            attachments,
            sagaRequestConfig
        );

    public delEffect = <
        TResponse = Record<string, never>,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs?: TParams | null,
        data?: TPayload | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        sagaRequestConfig?: SagaRequestConfig | null
    ) =>
        this.deleteEffect<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            sagaRequestConfig
        );

    protected _sagaFetch<
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        method: ResourceFetchMethods,
        kwargs: TParams | null = null,
        query: Query | null = null,
        sagaRequestConfig: SagaRequestConfig | null = null
    ): CallEffect<TResponse> {
        const runnerOptions: ResourceSagaRunnerConfig<TParams> = {
            kwargs,
            query,
            requestConfig: sagaRequestConfig,
        };

        return call(resourceSagaRunner, this.resource, method, runnerOptions);
    }

    protected _sagaPost<
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        method: ResourcePostMethods,
        kwargs: TParams | null = null,
        data: TPayload | string | null = null,
        query: Query | null = null,
        attachments: Attachments | null = null,
        sagaRequestConfig: SagaRequestConfig | null = null
    ): CallEffect<TResponse> {
        const runnerOptions: ResourceSagaRunnerConfig<TParams, TPayload> = {
            kwargs,
            data,
            query,
            attachments,
            requestConfig: sagaRequestConfig,
        };

        return call(resourceSagaRunner, this.resource, method, runnerOptions);
    }

    /* istanbul ignore next: not in use directly */
    protected createRequest<TPayload extends ObjectMap | string | null = any>(
        _0: string,
        _1: string,
        _2: Query,
        _3: TPayload | null,
        _4: Attachments,
        _5: SagaRequestConfig
    ): any {
        throw new Error('Not supported');
    }

    /* istanbul ignore next: not in use directly */
    protected doRequest(
        _0: any,
        _1: (response: any, error: any) => void
    ): void {
        throw new Error('Not supported');
    }

    /* istanbul ignore next: not in use directly */
    protected setHeader(_0: any, _1: string, _2: string | null): any {
        throw new Error('Not supported');
    }

    /* istanbul ignore next: not in use directly */
    protected wrapResponse(_0: any, _1: any, _2?: any): any {
        throw new Error('Not supported');
    }
}
