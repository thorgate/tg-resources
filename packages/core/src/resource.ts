import { hasValue, isFunction, isObject, isStatusCode } from '@tg-resources/is';
import { Attachments, Kwargs, ObjectMap, Query } from '@tg-resources/types';
import renderTemplate from 'lodash.template';

import DEFAULTS from './constants';
import {
    AbortError,
    InvalidResponseCode,
    NetworkError,
    RequestValidationError,
} from './errors';
import { ResourceErrorInterface, ResponseInterface } from './interfaces';
import { Route } from './route';
import {
    ConfigType,
    FetchOptions,
    PostOptions,
    RequestConfig,
    ResourceInterface,
    RouteConfig,
} from './types';
import { mergeConfig, serializeCookies } from './util';

/**
 * Check if obj is wrapper resource.
 * @param obj
 */
export function isWrapperResource(obj: any): boolean {
    return (
        obj instanceof Resource &&
        'resource' in obj &&
        typeof (obj as any).resource !== 'undefined' &&
        typeof (obj as any).resource === 'object'
    );
}

export abstract class Resource extends Route implements ResourceInterface {
    /**
     * @param apiEndpoint Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
     * @param config Customize config for this resource (see `Router.config`)
     */
    public constructor(apiEndpoint: string, config: RouteConfig = null) {
        super(config);
        this._apiEndpoint = apiEndpoint;
    }

    private readonly _apiEndpoint: string;

    public get apiEndpoint() {
        return this._apiEndpoint;
    }

    public config(requestConfig: RequestConfig = null): ConfigType {
        if (!this._config) {
            this._config = mergeConfig(
                this.parent ? this.parent.config() : DEFAULTS,
                this._customConfig
            );
        }

        if (requestConfig && isObject(requestConfig)) {
            return mergeConfig(this._config, requestConfig);
        }

        return this._config as ConfigType;
    }

    public clearConfigCache() {
        this._config = null;
    }

    public getHeaders(requestConfig: RequestConfig = null) {
        const config = this.config(requestConfig);
        const headers = {
            ...(this.parent ? this.parent.getHeaders() : {}),
            ...((isFunction(config.headers)
                ? config.headers()
                : config.headers) || {}),
        };

        const cookieVal = serializeCookies(this.getCookies(requestConfig));
        if (cookieVal) {
            headers.Cookie = cookieVal;
        }

        // if Accept is null/undefined, add default accept header automatically (backwards incompatible for text/html)
        if (!hasValue(headers.Accept)) {
            headers.Accept = config.defaultAcceptHeader;
        }

        return headers;
    }

    public getCookies(requestConfig: RequestConfig = null) {
        const config = this.config(requestConfig);
        return {
            ...(this.parent ? this.parent.getCookies() : {}),
            ...((isFunction(config.cookies)
                ? config.cookies()
                : config.cookies) || {}),
        };
    }

    public fetch = <TResult = any, TKwargs extends Kwargs<TKwargs> = {}>(
        kwargs?: TKwargs | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        return this._fetch<TResult, TKwargs>({
            method: 'get',
            kwargs,
            query,
            requestConfig,
        });
    };

    public head = <TResult = any, TKwargs extends Kwargs<TKwargs> = {}>(
        kwargs?: TKwargs | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        // istanbul ignore next: Tested in package that implement Resource
        return this._fetch<TResult, TKwargs>({
            method: 'head',
            kwargs,
            query,
            requestConfig,
        });
    };

    public options = <TResult = any, TKwargs extends Kwargs<TKwargs> = {}>(
        kwargs?: TKwargs | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        // istanbul ignore next: Tested in package that implement Resource
        return this._fetch<TResult, TKwargs>({
            method: 'options',
            kwargs,
            query,
            requestConfig,
        });
    };

    public post = <
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        return this._post<TResult, TData, TKwargs>({
            method: 'post',
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
        });
    };

    public patch = <
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        return this._post<TResult, TData, TKwargs>({
            method: 'patch',
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
        });
    };

    public put = <
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        return this._post<TResult, TData, TKwargs>({
            method: 'put',
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
        });
    };

    public del = <
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any => {
        return this._post<TResult, TData, TKwargs>({
            method: 'del',
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
        });
    };

    public renderPath<TKwargs extends Kwargs<TKwargs> = {}>(
        urlParams: TKwargs | null = null,
        requestConfig: RequestConfig = null
    ): string {
        let thePath = this.apiEndpoint;
        const config = this.config(requestConfig);

        // istanbul ignore next: Tested in package that implement Resource
        if (isObject(urlParams)) {
            thePath = renderTemplate(this.apiEndpoint)(urlParams);
        }

        return `${config.apiRoot}${thePath}`;
    }

    /* Internal API */

    protected abstract wrapResponse(
        res: any,
        error: any,
        req?: any
    ): ResponseInterface;
    protected abstract setHeader(
        req: any,
        key: string,
        value: string | null
    ): any;
    protected abstract createRequest<TData extends ObjectMap = any>(
        method: string,
        url: string,
        query: Query,
        data: TData | null,
        attachments: Attachments,
        requestConfig: RequestConfig
    ): any;
    protected abstract doRequest(
        req: any,
        resolve: (response: any, error: any) => void
    ): void;

    protected _fetch<TResult = any, TKwargs extends Kwargs<TKwargs> = {}>({
        method,
        kwargs = null,
        query = null,
        requestConfig = null,
    }: FetchOptions<TKwargs>): Promise<TResult> {
        const thePath = this.renderPath(kwargs, requestConfig);
        return this.handleRequest(
            this.createRequest(
                method,
                thePath,
                query,
                null,
                null,
                requestConfig
            ),
            requestConfig
        );
    }

    protected _post<
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >({
        method,
        kwargs = null,
        data = null,
        query = null,
        attachments = null,
        requestConfig = null,
    }: PostOptions<TData, TKwargs>): Promise<TResult> {
        const config = this.config(requestConfig);

        // istanbul ignore next: Tested in package that implement Resource
        if (attachments && !config.allowAttachments) {
            throw new Error(
                'Misconfiguration: "allowAttachments=true" is required when sending attachments!'
            );
        }

        const thePath = this.renderPath(kwargs, requestConfig);

        return this.handleRequest(
            this.createRequest(
                method,
                thePath,
                query,
                data || {},
                attachments,
                requestConfig
            ),
            requestConfig
        );
    }

    protected mutateRawResponse<T extends ResponseInterface>(
        rawResponse: ResponseInterface,
        requestConfig: RequestConfig
    ): T {
        const config = this.config(requestConfig);

        // istanbul ignore next: Tested in package that implement Resource
        if (isFunction(config.mutateRawResponse)) {
            return config.mutateRawResponse(rawResponse, requestConfig);
        }

        return rawResponse as T;
    }

    protected mutateResponse<TResult, T extends TResult = any>(
        responseData: TResult,
        rawResponse: ResponseInterface,
        requestConfig: RequestConfig
    ): T {
        const config = this.config(requestConfig);

        // istanbul ignore next: Tested in package that implement Resource
        if (isFunction(config.mutateResponse)) {
            return config.mutateResponse(
                responseData,
                rawResponse,
                this,
                requestConfig
            );
        }

        return responseData as T;
    }

    protected mutateError<T extends ResourceErrorInterface>(
        error: ResourceErrorInterface,
        rawResponse: ResponseInterface,
        requestConfig: RequestConfig
    ): T {
        // istanbul ignore next: Tested in package that implement Resource
        const config = this.config(requestConfig);

        // istanbul ignore next: Tested in package that implement Resource
        if (isFunction(config.mutateError)) {
            return config.mutateError(error, rawResponse, this, config);
        }

        // istanbul ignore next: Tested in package that implement Resource
        return error as T;
    }

    protected handleRequest<TResult>(
        req: any,
        requestConfig: RequestConfig
    ): Promise<TResult> {
        return this.ensureStatusAndJson<TResult>(
            new Promise(resolve => {
                const headers = this.getHeaders(requestConfig);

                if (headers && isObject(headers)) {
                    Object.keys(headers).forEach(key => {
                        if (hasValue(headers[key])) {
                            req = this.setHeader(req, key, headers[key]);
                        }
                    });
                }

                this.doRequest(req, (response, error) =>
                    resolve(this.wrapResponse(response, error, req))
                );
            }),
            requestConfig
        );
    }

    protected ensureStatusAndJson<TResult>(
        prom: Promise<ResponseInterface>,
        requestConfig: RequestConfig
    ): Promise<TResult> {
        const config = this.config(requestConfig);
        return prom.then((origRes: ResponseInterface) => {
            const res = this.mutateRawResponse(origRes, requestConfig);

            // If no error occured, e.g we have response and !hasError
            // istanbul ignore next: Tested in package that implement Resource
            if (res && !res.hasError) {
                if (isStatusCode(config.statusSuccess, res.status)) {
                    // Got statusSuccess response code, lets resolve this promise
                    return this.mutateResponse<TResult>(
                        res.data,
                        res,
                        requestConfig
                    );
                }

                if (isStatusCode(config.statusValidationError, res.status)) {
                    // Got statusValidationError response code, lets throw RequestValidationError
                    throw this.mutateError(
                        new RequestValidationError(
                            res.status,
                            res.text,
                            config
                        ),
                        res,
                        requestConfig
                    );
                } else {
                    // Throw a InvalidResponseCode error
                    throw this.mutateError(
                        new InvalidResponseCode(res.status, res.text),
                        res,
                        requestConfig
                    );
                }
            } else {
                let error;

                if (res && res.wasAborted) {
                    error = new AbortError(res.error);
                } else {
                    // res.hasError should only be true if network level errors occur (not statuscode errors)
                    const message = res && res.hasError ? res.error : '';

                    error = new NetworkError(
                        message ||
                            'Something went awfully wrong with the request, check network log.'
                    );
                }

                throw this.mutateError(error, res, requestConfig);
            }
        });
    }
}
