import { hasValue, isFunction, isObject, isStatusCode } from '@tg-resources/is';
import { routeTemplate } from '@tg-resources/route-template';

import DEFAULTS from './constants';
import {
    AbortError,
    InvalidResponseCode,
    NetworkError,
    RequestValidationError,
} from './errors';
import { Route } from './route';
import {
    AllowedFetchMethods,
    AllowedPostMethods,
    Attachments,
    ConfigType,
    EmptyPayload,
    Kwargs,
    ObjectMap,
    Query,
    RequestConfig,
    ResourceErrorInterface,
    ResourceInterface,
    ResponseInterface,
    RouteConfig,
} from './types';
import { mergeConfig, serializeCookies } from './util';

export abstract class Resource<
        Params extends Kwargs | null = Kwargs,
        TFetchResponse = any,
        TPostPayload extends ObjectMap | string | null = any,
        TPostResponse = TFetchResponse
    >
    extends Route
    implements
        ResourceInterface<Params, TFetchResponse, TPostPayload, TPostResponse>
{
    /**
     * @param apiEndpoint Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
     * @param config Customize config for this resource (see `Router.config`)
     */
    public constructor(apiEndpoint: string, config: RouteConfig = null) {
        super(config);

        this._apiEndpoint = apiEndpoint;

        this._routeTemplate = routeTemplate(apiEndpoint);
    }

    private readonly _apiEndpoint: string;

    private readonly _routeTemplate: ReturnType<typeof routeTemplate>;

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

    public get = <TResponse = TFetchResponse, TParams extends Params = Params>(
        kwargs: TParams | null = null,
        query: Query | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        this._fetch<TResponse, TParams>(kwargs, query, requestConfig, 'get');

    public fetch = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        query: Query | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        this.get<TResponse, TParams>(kwargs, query, requestConfig);

    public head = <
        TResponse = Record<string, never>,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        query: Query | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        // istanbul ignore next: Tested in package that implement Resource
        this._fetch<TResponse, TParams>(kwargs, query, requestConfig, 'head');

    public options = <
        TResponse = TFetchResponse,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        query: Query | null = null,
        requestConfig: RequestConfig = null
    ): Promise<TResponse> =>
        // istanbul ignore next: Tested in package that implement Resource
        this._fetch<TResponse, TParams>(
            kwargs,
            query,
            requestConfig,
            'options'
        );

    public post = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        data: TPayload | string | null = null,
        query: Query | null = null,
        attachments: Attachments | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        this._post<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
            'post'
        );

    public patch = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        data: TPayload | string | null = null,
        query: Query | null = null,
        attachments: Attachments | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        this._post<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
            'patch'
        );

    public put = <
        TResponse = TPostResponse,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        data: TPayload | string | null = null,
        query: Query | null = null,
        attachments: Attachments | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        this._post<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
            'put'
        );

    public del = <
        TResponse = EmptyPayload,
        TPayload extends TPostPayload = TPostPayload,
        TParams extends Params = Params
    >(
        kwargs: TParams | null = null,
        data: TPayload | string | null = null,
        query: Query | null = null,
        attachments: Attachments | null = null,
        requestConfig: RequestConfig | null = null
    ): Promise<TResponse> =>
        this._post<TResponse, TPayload, TParams>(
            kwargs,
            data,
            query,
            attachments,
            requestConfig,
            'del'
        );

    public renderPath<TParams extends Kwargs | null = Params>(
        urlParams: TParams | null = null,
        requestConfig: RequestConfig = null
    ): string {
        const config = this.config(requestConfig);

        // istanbul ignore next: Tested in package that implements Resource
        if (isObject(urlParams)) {
            this._routeTemplate.configure(config.apiRoot, undefined);

            return this._routeTemplate(urlParams);
        }

        return `${config.apiRoot}${this.apiEndpoint}`;
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

    protected abstract createRequest<
        TPayload extends ObjectMap | string | null = any
    >(
        method: string,
        url: string,
        query: Query,
        data: TPayload | null,
        attachments: Attachments,
        requestConfig: RequestConfig
    ): any;

    protected abstract doRequest(
        req: any,
        resolve: (response: any, error: any) => void
    ): void;

    protected _fetch<
        TResponse = TFetchResponse,
        TParams extends Kwargs | null = Params
    >(
        kwargs: TParams | null = null,
        query: Query | null = null,
        requestConfig: RequestConfig | null = null,
        method: AllowedFetchMethods = 'get'
    ): Promise<TResponse> {
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
        TResponse = TPostResponse,
        TPayload extends ObjectMap | string | null = TPostPayload,
        TParams extends Kwargs | null = Params
    >(
        kwargs: TParams | null = null,
        data: TPayload | string | null = null,
        query: Query = null,
        attachments: Attachments = null,
        requestConfig: RequestConfig = null,
        method: AllowedPostMethods = 'post'
    ): Promise<TResponse> {
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

    protected mutateResponse<R, T extends R = any>(
        responseData: R,
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

    protected handleRequest<R>(
        req: any,
        requestConfig: RequestConfig
    ): Promise<R> {
        return this.ensureStatusAndJson<R>(
            new Promise((resolve) => {
                const headers = this.getHeaders(requestConfig);

                if (headers && isObject(headers)) {
                    Object.keys(headers).forEach((key) => {
                        if (hasValue(headers[key])) {
                            // eslint-disable-next-line no-param-reassign
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

    protected ensureStatusAndJson<R>(
        prom: Promise<ResponseInterface>,
        requestConfig: RequestConfig
    ): Promise<R> {
        const config = this.config(requestConfig);
        return prom.then((origRes: ResponseInterface) => {
            const res = this.mutateRawResponse(origRes, requestConfig);

            // If no error occured, e.g we have response and !hasError
            // istanbul ignore next: Tested in package that implement Resource
            if (res && !res.hasError) {
                if (isStatusCode(config.statusSuccess, res.status)) {
                    // Got statusSuccess response code, lets resolve this promise
                    return this.mutateResponse<R>(res.data, res, requestConfig);
                }

                if (isStatusCode(config.statusValidationError, res.status)) {
                    // Got statusValidationError response code, lets throw RequestValidationError
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
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
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
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

                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw this.mutateError(error, res, requestConfig);
            }
        });
    }
}
