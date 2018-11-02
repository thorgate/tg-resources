export type Optional<T> = T | null;

export type OptionalMap<T> = {
    [K in keyof T]?: T[K]
};

export interface ObjectMap<T = any> {
    [key: string]: T;
}

export type ObjectMapFn<T = any> = () => ObjectMap<T>;


export type ConfigObjectFn = ObjectMap<string | null> | ObjectMapFn<string | null>;


export type Query = ObjectMap<string> | null;

export type MutateResponseFn = <R>(
    responseData: R, rawResponse?: ResponseInterface, resource?: ResourceInterface, requestConfig?: RequestConfig
) => any;
export type MutateErrorFn = (
    error: ResourceErrorInterface, rawResponse?: ResponseInterface, resource?: ResourceInterface, requestConfig?: RequestConfig
) => any;
export type MutateRawResponseFn = (rawResponse?: ResponseInterface, requestConfig?: RequestConfig) => any;

export type ParseErrorFn = (errorText: any, config: ConfigType) => ValidationErrorInterface | null;

export type PrepareErrorFn = (err: any, config: ConfigType) => ValidationErrorInterface | null | any;


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

    // allow Index Signature
    [key: string]: any;
}


export type RequestConfig = Optional<OptionalMap<ConfigType>>;


export abstract class ValidationErrorInterface {
    public fieldName: string | number | undefined;

    protected constructor(errors: any) {
        // Store errors
        this._errors = errors;
    }

    // Losing type check but does not restrict types at first
    // Can be changed to be more restrictive
    protected readonly _errors: any;

    public get errors() {
        return this._errors;
    }

    // Support for .. of loops
    public [Symbol.iterator](): Iterator<any> {
        const instance = this;

        let curKey = 0;
        let done = false;

        return {
            next() {
                const nextVal = instance.errorByIndex(curKey);

                // Note: If a custom error handler does not coerce undefined to null,
                //  the iterator will stop too early
                //
                // Feel free to submit a PR if this annoys you!
                if (nextVal === undefined) {
                    done = true;
                } else {
                    curKey += 1;
                }

                return {
                    done,
                    value: nextVal,
                };
            },
        };
    }

    /**
     * Used by firstError and iteration protocol
     */
    public errorByIndex(index: number) {
        return this._errors[index];
    }

    /* istanbul ignore next: just an interface */
    public hasError() {
        return this._errors.length > 0;
    }

    public bindToField(fieldName: string | number) {
        // istanbul ignore next: Only happens w/ custom error handlers
        if (process.env.NODE_ENV !== 'production') {
            if (this.fieldName && this.fieldName !== fieldName) {
                console.error(
                    `ValidationErrorInterface: Unexpected rebind of ${this} as ${fieldName} (was ${this.fieldName})`,
                );
            }
        }

        this.fieldName = fieldName;
    }

    public abstract asString(glue?: string): string;

    public toString() {
        return this.asString();
    }

    public map<U>(callbackfn: (value: any, index?: number, array?: any[]) => U, thisArg?: any): U[] {
        return this._iter().map(callbackfn, thisArg);
    }

    public forEach(callbackfn: (value: any, index?: number, array?: any[]) => void, thisArg?: any): void {
        this._iter().forEach(callbackfn, thisArg);
    }

    public filter(callbackfn: (value: any, index?: number, array?: any[]) => boolean, thisArg?: any) {
        return this._iter().filter(callbackfn, thisArg);
    }

    /**
     * Iterator used for .forEach/.filter/.map
     */
    protected _iter() {
        return this._errors;
    }
}

export interface Attachment {
    field: string;
    name: string;
    file: Blob | Buffer;
}

export type Attachments = null | Attachment[];


export type AllowedFetchMethods = 'get' | 'head' | 'options';

export type AllowedPostMethods = 'post' | 'patch' | 'put' | 'del';

export type AllowedMethods = AllowedFetchMethods | AllowedPostMethods;


export interface RouteMap {
    [key: string]: ResourceInterface | RouterInterface;
}


export interface RouteAble {
    readonly parent: RouterInterface | null;
    readonly isBound: boolean;
    setParent(parent: RouterInterface): void;
    getConfig(): RequestConfig;

    getHeaders(): ObjectMap<string | null>;
    getCookies(): ObjectMap<string | null>;

    config(requestConfig?: RequestConfig): ConfigType;
    setConfig(config: RequestConfig): void;
    clearConfigCache(): void;
}


export interface RouterInterface extends RouteAble {
    [key: string]: ResourceInterface | RouterInterface | any;
}


export interface ResourceInterface extends RouteAble {
    readonly apiEndpoint: string;

    fetch<
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: RequestConfig | null): Promise<R> | any;
    head<
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: RequestConfig | null): Promise<R> | any;
    options<
        R = any, Params extends { [K in keyof Params]?: string } = {}
    >(kwargs?: Params | null, query?: Query | null, requestConfig?: RequestConfig | null): Promise<R> | any;

    post<
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments, requestConfig?: RequestConfig | null
    ): Promise<R> | any;
    patch<
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments, requestConfig?: RequestConfig | null
    ): Promise<R> | any;
    put<
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments, requestConfig?: RequestConfig | null
    ): Promise<R> | any;
    del<
        R = any, D extends ObjectMap = any, Params extends { [K in keyof Params]?: string } = {}
    >(
        kwargs?: Params | null, data?: D | string | null, query?: Query | null,
        attachments?: Attachments, requestConfig?: RequestConfig | null
    ): Promise<R> | any;

    renderPath<
        Params extends { [K in keyof Params]?: string } = {}
    >(urlParams?: Params | null, requestConfig?: RequestConfig | null): string;

    [key: string]: any;
}


export abstract class ResourceErrorInterface {
    protected readonly _message: string;

    protected constructor(message: string) {
        this._message = message;
    }

    public toString() {
        return this._message;
    }

    public get isNetworkError() {
        return false;
    }

    // istanbul ignore next: Tested in package that implement Resource
    public get isInvalidResponseCode() {
        return false;
    }

    public get isValidationError() {
        return false;
    }
}

export abstract class ResponseInterface {
    // istanbul ignore next: Tested in package that implement Resource
    public constructor(response: Optional<any>, error: Optional<any> = null, request: Optional<any> = null) {
        this._response = response;
        this._error = error;
        this._request = request;
    }

    public get response(): Optional<any> {
        // istanbul ignore next: Tested in package that implement Resource
        return this._response;
    }

    public get error(): Optional<any> {
        return this._error;
    }

    public get hasError() {
        return !!this.error;
    }

    public abstract get status(): Optional<number>;

    public get statusCode() {
        // istanbul ignore next: Tested in package that implement Resource
        return this.status;
    }

    public abstract get statusType(): Optional<number>;

    public abstract get text(): Optional<string>;

    public abstract get data(): Optional<any>;

    public abstract get headers(): Optional<any>;

    public abstract get contentType(): Optional<string>;

    protected readonly _response: Optional<any>;
    protected readonly _error: Optional<any>;
    protected readonly _request: Optional<any>;
}
