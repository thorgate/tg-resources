import { call } from 'redux-saga/effects';
import {
    Attachments,
    Kwargs,
    ObjectMap,
    Query,
    RequestConfig,
    Resource,
    ResourceFetchMethods,
    ResourcePostMethods,
    RouterInterface,
} from 'tg-resources';

import { DEFAULT_CONFIG } from './constants';
import { resourceSagaRunner } from './resourceSagaRunner';
import { ResourceSagaRunnerConfig, SagaConfigType, SagaRequestConfig, SagaRouteConfig } from './types';


export function isSagaResource<Klass extends Resource>(obj: any): obj is SagaResource<Klass> {
    return obj instanceof Resource &&
        'resource' in obj &&
        typeof (obj as any).resource !== 'undefined' &&
        typeof (obj as any).resource === 'object';
}


export function isSagaResourceInitialized(obj: any, config: SagaRequestConfig): boolean {
    return isSagaResource(obj) && obj.config(config).initializeSaga;
}


export class SagaResource<Klass extends Resource> extends Resource {
    public constructor(
        apiEndpoint: string,
        config: SagaRouteConfig = null,
        resourceKlass: { new(apiEndpoint: string, config?: RequestConfig): Klass; },
    ) {
        super(apiEndpoint, config as Pick<typeof config, keyof RequestConfig>);
        this._resource = new resourceKlass(apiEndpoint, config as Pick<typeof config, keyof RequestConfig>);
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
    public fetch = <Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, query?: Query | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaFetch<Params | null | undefined>('fetch', kwargs, query, sagaRequestConfig);
    };

    public head = <Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, query?: Query | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaFetch<Params | null | undefined>('head', kwargs, query, sagaRequestConfig);
    };

    public options = <Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, query?: Query | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaFetch<Params | null | undefined>('options', kwargs, query, sagaRequestConfig);
    };

    public post = <D extends ObjectMap = any, Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<D, Params>('post', kwargs, data, query, attachments, sagaRequestConfig);
    };

    public patch = <D extends ObjectMap = any, Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<D, Params>('patch', kwargs, data, query, attachments, sagaRequestConfig);
    };

    public put = <D extends ObjectMap = any, Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<D, Params>('put', kwargs, data, query, attachments, sagaRequestConfig);
    };

    public del = <D extends ObjectMap = any, Params extends Kwargs<Params> = {}>(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments | null, sagaRequestConfig?: SagaRequestConfig | null
    ) => {
        return this._sagaPost<D, Params>('del', kwargs, data, query, attachments, sagaRequestConfig);
    };

    protected _sagaFetch<Params extends Kwargs<Params> = {}>(
        method: ResourceFetchMethods, kwargs: Params | null = null, query: Query | null = null,
        sagaRequestConfig: SagaRequestConfig | null = null
    ) {
        const runnerOptions: ResourceSagaRunnerConfig<Params> = {
            kwargs,
            query,
            requestConfig: sagaRequestConfig,
        };

        if (this.config(sagaRequestConfig).initializeSaga) {
            return resourceSagaRunner<Params>(this.resource, method, runnerOptions);
        }

        return call(
            resourceSagaRunner,
            this.resource,
            method,
            runnerOptions,
        );
    }

    protected _sagaPost<D extends ObjectMap = any, Params extends Kwargs<Params> = {}>(
        method: ResourcePostMethods, kwargs: Params | null = null, data: D | string | null = null, query: Query | null = null,
        attachments: Attachments | null = null, sagaRequestConfig: SagaRequestConfig | null = null
    ) {
        const runnerOptions: ResourceSagaRunnerConfig<Params, D> = {
            kwargs,
            data,
            query,
            attachments,
            requestConfig: sagaRequestConfig,
        };

        if (this.config(sagaRequestConfig).initializeSaga) {
            return resourceSagaRunner<Params>(this.resource, method, runnerOptions);
        }

        return call(
            resourceSagaRunner,
            this.resource,
            method,
            runnerOptions,
        );
    }

    /* istanbul ignore next: not in use directly */
    protected createRequest<D extends ObjectMap = any>(
        _0: string, _1: string, _2: Query, _3: D | null, _4: Attachments, _5: SagaRequestConfig
    ): any {
        throw new Error('Not supported');
    }

    /* istanbul ignore next: not in use directly */
    protected doRequest(_0: any, _1: (response: any, error: any) => void): void {
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
