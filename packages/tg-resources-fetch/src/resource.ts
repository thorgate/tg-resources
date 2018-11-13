import { hasValue, isArray, isObject, isString } from '@tg-resources/is';
import qs from 'qs';
import {
    AllowedMethods,
    Attachments,
    ObjectMap,
    Optional,
    Query,
    RequestConfig,
    Resource,
    ResponseInterface
} from 'tg-resources';


interface HeadersObject {
    [key: string]: any;
}

interface FetchResponseInterface {
    status: number;
    headers: HeadersObject;

    text: string | null;
    body: any | null;
}


export class FetchResponse extends ResponseInterface {
    public get response(): Optional<FetchResponseInterface> {
        return this._response;
    }

    public get status() {
        if (this.response) {
            return this.response.status;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get statusType() {
        if (this.status) {
            /* tslint:disable-next-line:no-bitwise */
            return this.status / 100 | 0;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get text() {
        if (this.response) {
            return this.response.text;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get data() {
        if (this.response) {
            // Return text if response is of type text/*
            if (this.contentType && this.contentType.startsWith('text/')) {
                return this.text;
            }

            return this.response.body || this.text;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get contentType() {
        if (this.headers) {
            return this.headers['content-type'];
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get headers(): HeadersObject {
        if (this.response) {
            return this.response.headers;
        }

        // istanbul ignore next: Only happens on network errors
        return {};
    }
}


function parseMethod(method: AllowedMethods) {
    switch (method) {
        case 'get':
            return 'GET';

        case 'head':
            return 'HEAD';

        case 'put':
            return 'PUT';

        case 'del':
            return 'DELETE';

        default:
            return method.toUpperCase();
    }
}


function parseHeaders(headers: Headers): HeadersObject {
    const headersObject: HeadersObject = {};

    headers.forEach((value, key) => {
        headersObject[key] = value;
    });

    return headersObject;
}


function parseFetchResponse(response: Response, req: Request): Promise<FetchResponseInterface> {
    // Content type will be required
    if (!response.headers.has('content-type')) {
        // istanbul ignore next: Only happens w/ custom server that does not set Content-Type
        throw new Error('Content type is missing from request');
    }

    // Get content string to use correct parser
    const contentType: string = response.headers.get('content-type') as string;

    if (req.method.toLowerCase() === 'head') {
        return Promise.resolve({
            status: response.status,
            headers: parseHeaders(response.headers),
            body: {},
            text: '{}',
        });
    }

    if (contentType.includes('application/json')) {
        return response.json().then((body: any) => ({
            status: response.status,
            headers: parseHeaders(response.headers),
            text: JSON.stringify(body),
            body,
        }));
    }

    // form urlencoded data get's converted to object
    if (contentType.includes('application/x-www-form-urlencoded')) {
        return response.text().then((body: any) => ({
            status: response.status,
            headers: parseHeaders(response.headers),
            text: body,
            body: qs.parse(body),
        }));
    }

    // Fallback parsing scheme is text
    return response.text().then((body: any) => ({
        status: response.status,
        headers: parseHeaders(response.headers),
        text: body,
        body,
    }));
}


export class FetchResource extends Resource {
    protected createRequest<
        D extends ObjectMap = any
    >(
        method: AllowedMethods, url: string, query: Query, data: D | string | null,
        attachments: Attachments, requestConfig: RequestConfig
    ): any {
        let headers: { [key: string]: any } | null = null;
        let body: string | FormData | null = null;
        let contentType: string | null = null;
        if (data) {
            if (isString(data)) {
                contentType = 'application/x-www-form-urlencoded';
                body = data;
            } else if (attachments) {
                const form = new FormData();

                attachments.forEach((attachment) => {
                    form.append(attachment.field, attachment.file as any, attachment.name);
                });

                // Set all the fields
                Object.keys(data).forEach((fieldKey) => {
                    const value = data[fieldKey];

                    // Future: Make this logic configurable
                    if (hasValue(value)) {
                        if (isArray(value)) {
                            // Send arrays as multipart arrays
                            value.forEach((fValue) => {
                                form.append(`${fieldKey}[]`, fValue);
                            });
                        } else if (isObject(value)) {
                            // Posting objects as stringifyed field contents to keep things consistent
                            form.append(fieldKey, JSON.stringify(value));
                        } else {
                            // Convert values via their toString
                            form.append(fieldKey, `${value}`);
                        }
                    }
                });

                body = form;

                if ('getHeaders' in (form as any)) {
                    headers = (form as any).getHeaders();
                }
            } else {
                body = JSON.stringify(data);
                contentType = 'application/json';
            }
        }

        let theUrl = url;
        if (query) {
            theUrl = `${theUrl}?${qs.stringify(query)}`;
        }

        let credentials: 'omit' | 'include' = 'omit';
        if (this.config(requestConfig).withCredentials) {
            credentials = 'include';
        }


        const req = new Request(theUrl, {
            method: parseMethod(method),
            redirect: 'follow',
            credentials,
            body,
        });

        if (hasValue(headers)) {
            Object.keys(headers).forEach((key) => {
                if (hasValue(headers)) {
                    req.headers.set(key, headers[key]);
                }
            });
        }

        if (contentType) {
            req.headers.set('content-type', contentType);
        }

        return req;
    }

    protected doRequest(req: Request, resolve: (response: any, error: any) => void): void {
        fetch(req)
            .then((res) => parseFetchResponse(res, req))
            .then((response) => {
                resolve(response, null);
            })
            .catch((error) => {
                resolve(null, error);
            });
    }

    protected setHeader(req: Request, key: string, value: string | null): any {
        if (value) {
            req.headers.set(key, value);
        }

        return req;
    }

    protected wrapResponse(res: FetchResponseInterface | null, error: any, req?: Request): ResponseInterface {
        return new FetchResponse(res, error, req);
    }

}
