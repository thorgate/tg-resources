import request from 'superagent';

import ResponseWrapper from '../response';
import GenericResource from '../base';


export class SuperagentResponse extends ResponseWrapper {
    get status() {
        return this.response.status;
    }

    get statusType() {
        return this.response.statusType;
    }

    get text() {
        return this.response.text;
    }

    get data() {
        // Return text if response is of type text/*
        if (this.response.type.startsWith('text/')) {
            return this.text;
        }

        return this.response.body || this.text;
    }

    get headers() {
        return this.response.header;
    }
}

export class SuperAgentResource extends GenericResource {
    static wrapResponse(response, error, req) { // eslint-disable-line no-unused-vars
        // For superagent, all 4XX/5XX response codes also return an error object. Since
        // tg-resources handles these errors in the GenericResource we need to only send
        // error object here if it is not due to a response code.
        //
        // Network errors in superagent don't have `err.status`
        return new SuperagentResponse(response, error && error.status === undefined ? error : null);
    }

    createRequest(method, url, query, data, requestConfig) { // eslint-disable-line class-methods-use-this
        method = method.toLowerCase();

        let req = request[method](url);

        if (this.config(requestConfig).withCredentials) {
            req = req.withCredentials();
        }

        if (query) {
            req = req.query(query);
        }

        if (data) {
            req = req.send(data);
        }

        return req;
    }

    doRequest(req, resolve) { // eslint-disable-line class-methods-use-this
        req.end((err, res) => {
            resolve(res, err);
        });
    }

    setHeader(req, key, value) { // eslint-disable-line class-methods-use-this
        return req.set(key, value);
    }
}
