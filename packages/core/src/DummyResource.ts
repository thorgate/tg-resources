/* istanbul ignore file */
import {
    Attachments,
    Kwargs,
    ObjectMap,
    Optional,
    Query,
    RequestConfig,
    Resource,
    ResponseInterface,
} from '.';

export class DummyResponse extends ResponseInterface {
    public constructor(
        response: Optional<any>,
        error: Optional<any> = null,
        request: Optional<any> = null
    ) {
        super(response, error, request);
        this._data = response;
    }

    private _data: any;

    public get status(): number {
        return 200;
    }

    public get statusType(): number {
        return 2;
    }

    public get text(): string {
        return '';
    }

    public get data(): any {
        return this._data;
    }

    public get headers(): any {
        return this._data.headers;
    }

    public get wasAborted(): boolean {
        return false;
    }

    get contentType(): string {
        return 'application/json';
    }
}

class DummyRequest {
    public readonly method: string;

    public readonly url: string;

    public readonly query: Query;

    public readonly data: any;

    public readonly attachments: Attachments;

    public readonly requestConfig: RequestConfig;

    public headers: ObjectMap;

    constructor(
        method: string,
        url: string,
        query: Query,
        data: any | null,
        attachments: Attachments,
        requestConfig: RequestConfig
    ) {
        this.method = method;
        this.url = url;
        this.query = query;
        this.data = data;
        this.attachments = attachments;
        this.requestConfig = requestConfig;

        this.headers = {};
    }

    public set(key: string, value: string): this {
        this.headers[key] = value;
        return this;
    }

    public end(resolve: (response: any, error: any) => void) {
        resolve(
            {
                method: this.method,
                url: this.url,
                data: this.data,
                query: this.query,
                attachments: this.attachments,
                requestConfig: this.requestConfig,
                headers: this.headers,
            },
            null
        );
    }
}

export class DummyResource<
    Params extends Kwargs | null,
    TFetchResponse = any,
    TPostPayload extends ObjectMap | string | null = any,
    TPostResponse = TFetchResponse
> extends Resource<Params, TFetchResponse, TPostPayload, TPostResponse> {
    public wrapResponse<Req, Res, Err>(
        res: Res,
        error: Err,
        req: Req
    ): ResponseInterface {
        return new DummyResponse(res, error, req);
    }

    public createRequest<TData extends ObjectMap | string | null = any>(
        method: string,
        url: string,
        query: Query,
        data: TData | null,
        attachments: Attachments,
        requestConfig: RequestConfig
    ) {
        return new DummyRequest(
            method,
            url,
            query,
            data,
            attachments,
            requestConfig
        );
    }

    public doRequest<Response, ErrorType>(
        req: any,
        resolve: (response: Response, error: ErrorType) => void
    ): void {
        (req as DummyRequest).end(resolve);
    }

    public setHeader(req: any, key: string, value: string) {
        return (req as DummyRequest).set(key, value);
    }
}
