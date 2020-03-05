import {
    AllowedFetchMethods,
    AllowedPostMethods,
    Attachments,
    Kwargs,
    ObjectMap,
    ObjectMapFn,
    Optional,
    Query,
} from '@tg-resources/types';

import {
    ResourceErrorInterface,
    ResponseInterface,
    ValidationErrorInterface,
} from './interfaces';

export type ConfigObjectFn =
    | ObjectMap<string | null>
    | ObjectMapFn<string | null>;

export type MutateResponseFn = <TResult>(
    responseData: TResult,
    rawResponse?: ResponseInterface,
    resource?: ResourceInterface,
    requestConfig?: RequestConfig
) => any;
export type MutateErrorFn = (
    error: ResourceErrorInterface,
    rawResponse?: ResponseInterface,
    resource?: ResourceInterface,
    requestConfig?: RequestConfig
) => any;
export type MutateRawResponseFn = (
    rawResponse?: ResponseInterface,
    requestConfig?: RequestConfig
) => any;

export type ParseErrorFn = (
    errorText: any,
    config: ConfigType
) => ValidationErrorInterface | null;

export type PrepareErrorFn = (
    err: any,
    config: ConfigType
) => ValidationErrorInterface | null | any;

export interface ConfigType {
    /**
     * Base for all resource paths
     */
    apiRoot: string;

    /**
     * Optional Function or Object which can be used to add any additional headers to requests.
     */
    headers: Optional<ConfigObjectFn>;

    /**
     * Optional Function or Object which can be used to add any additional cookies to requests.
     * Please note that in modern browsers this is disabled due to security concerns.
     */
    cookies: Optional<ConfigObjectFn>;

    mutateResponse: Optional<MutateResponseFn>;
    mutateError: Optional<MutateErrorFn>;
    mutateRawResponse: Optional<MutateRawResponseFn>;

    /**
     * Array of status codes to treat as a success. Default: [200, 201, 204]
     */
    statusSuccess: number | number[];

    /**
     * Array of status codes to treat as ValidationError. Default: [400]
     */
    statusValidationError: number | number[];

    /**
     * Default accept header that is automatically added to requests (only if headers.Accept=undefined).
     * Default: 'application/json'
     */
    defaultAcceptHeader: string;

    parseErrors: ParseErrorFn;
    prepareError: PrepareErrorFn;

    /**
     * Allow request backend to send cookies/authentication headers,
     * useful when using same API for server-side rendering.
     */
    withCredentials: boolean;

    /**
     * Allow attachments to be added to POST/PUT/PATCH requests.
     */
    allowAttachments: boolean;

    /**
     * signal allows passing in an AbortSignal object that allows you
     *  to abort one or more requests as and when desired.
     */
    signal: Optional<AbortSignal>;

    // allow Index Signature
    [key: string]: any;
}

/**
 * Router and Resource config
 */
export type RouteConfigType = Omit<ConfigType, 'signal'>;

export type RouteConfig = Optional<Partial<RouteConfigType>>;

export type RequestConfig = Optional<Partial<ConfigType>>;

export interface FetchOptions<TKwargs extends Kwargs<TKwargs> = {}> {
    method: AllowedFetchMethods;
    kwargs?: TKwargs | null;
    query?: Query | null;
    requestConfig?: RequestConfig | null;
}

export interface PostOptions<
    TData extends ObjectMap = any,
    TKwargs extends Kwargs<TKwargs> = {}
> {
    method: AllowedPostMethods;
    kwargs?: TKwargs | null;
    data?: TData | string | null;
    query?: Query;
    attachments?: Attachments;
    requestConfig?: RequestConfig;
}

export interface RouteMap {
    [key: string]: ResourceInterface | RouterInterface;
}

export interface RouteInterface {
    readonly parent: RouterInterface | null;
    readonly isBound: boolean;
    readonly routeName: string;

    setParent(parent: RouterInterface, routeName: string): void;
    getConfig(): RequestConfig;

    getHeaders(): ObjectMap<string | null>;
    getCookies(): ObjectMap<string | null>;

    config(requestConfig?: RequestConfig): RouteConfigType;
    setConfig(config: RouteConfigType): void;
    clearConfigCache(): void;
}

export interface RouterInterface extends RouteInterface {
    [key: string]: ResourceInterface | RouterInterface | any;
}

export type ResourceFetchMethod<
    TResult = any,
    TKwargs extends Kwargs<TKwargs> = {}
> = (
    kwargs?: TKwargs | null,
    query?: Query | null,
    requestConfig?: RequestConfig | null
) => Promise<TResult> | any;

export type ResourcePostMethod<
    TResult = any,
    TData extends ObjectMap = any,
    TKwargs extends Kwargs<TKwargs> = {}
> = (
    kwargs?: TKwargs | null,
    data?: TData | string | null,
    query?: Query | null,
    attachments?: Attachments,
    requestConfig?: RequestConfig | null
) => Promise<TResult> | any;

export interface ResourceInterface extends RouteInterface {
    readonly apiEndpoint: string;

    config(requestConfig?: RequestConfig): ConfigType;

    fetch<TResult = any, TKwargs extends Kwargs<TKwargs> = {}>(
        kwargs?: TKwargs | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;
    head<TResult = any, TKwargs extends Kwargs<TKwargs> = {}>(
        kwargs?: TKwargs | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;
    options<TResult = any, TKwargs extends Kwargs<TKwargs> = {}>(
        kwargs?: TKwargs | null,
        query?: Query | null,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;

    post<
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;
    patch<
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;
    put<
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;
    del<
        TResult = any,
        TData extends ObjectMap = any,
        TKwargs extends Kwargs<TKwargs> = {}
    >(
        kwargs?: TKwargs | null,
        data?: TData | string | null,
        query?: Query | null,
        attachments?: Attachments,
        requestConfig?: RequestConfig | null
    ): Promise<TResult> | any;

    renderPath<TKwargs extends Kwargs<TKwargs> = {}>(
        urlParams?: TKwargs | null,
        requestConfig?: RequestConfig | null
    ): string;

    [key: string]: any;
}
