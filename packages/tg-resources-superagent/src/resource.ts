import {
    AllowedMethods,
    Attachments,
    ObjectMap,
    Optional,
    Query,
    RequestConfig,
    Resource,
    ResponseInterface,
} from '@tg-resources/core';
import { hasValue, isArray, isObject } from '@tg-resources/is';
import request, {
    Response,
    ResponseError,
    SuperAgentRequest,
} from 'superagent';

export class SuperagentResponse extends ResponseInterface {
    public get response(): Optional<Response> {
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
        if (this.response) {
            return this.response.statusType;
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
        if (this.response && this.contentType) {
            // Return text if response is of type text/*
            if (this.contentType.startsWith('text/')) {
                return this.text;
            }

            return this.response.body || this.text;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get contentType() {
        if (this.response) {
            return this.response.type;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get headers() {
        if (this.response) {
            return this.response.header;
        }

        // istanbul ignore next: Only happens on network errors
        return null;
    }

    public get wasAborted(): boolean {
        return (
            this.hasError &&
            this.error &&
            `${this.error}`.includes('request has been aborted')
        );
    }
}

export class SuperAgentResource extends Resource {
    protected wrapResponse(
        response: Response,
        error: ResponseError | Error | null = null
    ) {
        // For superagent, all 4XX/5XX response codes also return an error object. Since
        // tg-resources handles these errors in the Resource we need to only send
        // error object here if it is not due to a response code.
        //
        // Network errors in superagent don't have `err.status`
        return new SuperagentResponse(
            response,
            error && 'status' in error && hasValue(error.status) ? null : error
        );
    }

    protected createRequest<D extends ObjectMap = any>(
        method: AllowedMethods,
        url: string,
        query: Query,
        data: D | null,
        attachments: Attachments,
        requestConfig: RequestConfig
    ) {
        let req = request[method](url);

        if (this.config(requestConfig).withCredentials) {
            req = req.withCredentials();
        }

        if (query) {
            req = req.query(query);
        }

        if (hasValue(data)) {
            // If attachments are used construct a multipart request
            if (attachments) {
                attachments.forEach((attachment) => {
                    req = req.attach(
                        attachment.field,
                        attachment.file,
                        attachment.name
                    );
                });

                // Set all the fields
                Object.keys(data).forEach((fieldKey) => {
                    const value = data[fieldKey];

                    // Future: Make this logic configurable
                    if (hasValue(value)) {
                        if (isArray(value)) {
                            // Send arrays as multipart arrays
                            value.forEach((fValue) => {
                                req = req.field(`${fieldKey}[]`, fValue);
                            });
                        } else if (isObject(value)) {
                            // Posting objects as field contents is not supported by superagent
                            //  to work around this we just jsonify them
                            req = req.field(fieldKey, JSON.stringify(value));
                        } else {
                            // Convert values via their toString
                            req = req.field(fieldKey, `${value}`);
                        }
                    }
                });
            } else {
                req = req.send(data);
            }
        }

        const { signal } = this.config(requestConfig);
        if (signal) {
            // This is not pretty, but it avoids the need to keep a memory of requests
            //  in the resource. Once the request ends the listener is cleaned up.
            (req as any).tg$Signal = signal;
            (req as any).tg$Listener = () => {
                req.abort();
            };

            signal.addEventListener('abort', (req as any).tg$Listener);

            if (signal.aborted) {
                req.abort();
            }
        }

        return req;
    }

    protected doRequest(
        req: SuperAgentRequest,
        resolve: (
            response: Optional<Response>,
            error: Optional<ResponseError | Error>
        ) => void
    ) {
        const cleanupSignal = () => {
            if ((req as any).tg$Signal) {
                (req as any).tg$Signal.removeEventListener(
                    'abort',
                    (req as any).tg$Listener
                );

                // Early cleanup
                delete (req as any).tg$Listener;
                delete (req as any).tg$Signal;
            }
        };

        // see https://github.com/visionmedia/superagent/issues/1344#issuecomment-386120607
        req.on('abort', () => {
            cleanupSignal();

            resolve(null, new Error('request has been aborted'));
        });

        req.end((err, res) => {
            cleanupSignal();

            resolve(res, err);
        });
    }

    protected setHeader(req: SuperAgentRequest, key: string, value: string) {
        return req.set(key, value);
    }
}
