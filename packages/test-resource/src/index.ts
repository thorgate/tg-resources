import { Attachments, ObjectMap, Optional, Query } from '@tg-resources/types';
import { RequestConfig, Resource, ResponseInterface } from 'tg-resources';

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
        return JSON.stringify(this._data);
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

    public Data: any = null;
    public Error: any = null;
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
        resolve(this.Data, this.Error);
    }
}

export class DummyResource extends Resource {
    public Data: any = null;
    public Error: any = null;

    public wrapResponse<Req, Res, Err>(
        res: Res,
        error: Err,
        req: Req
    ): ResponseInterface {
        return new DummyResponse(res, error, req);
    }

    public createRequest<D extends ObjectMap = any>(
        method: string,
        url: string,
        query: Query,
        data: D | null,
        attachments: Attachments,
        requestConfig: RequestConfig
    ) {
        const request = new DummyRequest(
            method,
            url,
            query,
            data,
            attachments,
            requestConfig
        );

        request.Data = this.Data;
        request.Error = this.Error;

        return request;
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
