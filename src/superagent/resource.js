import request from 'superagent';

import ResponseWrapper from '../response';
import GenericResource from '../base';
import { hasValue } from '../typeChecks';


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
        if (this.disableDeserialize) {
            return this.text;
        }

        return this.response.body;
    }

    get headers() {
        return this.response.header;
    }
}

export class SuperAgentResource extends GenericResource {
    wrapResponse(response, error, req) {
        const disableDeserialize = !hasValue(req.get('Accept'));

        // For superagent, all 4XX/5XX response codes also return an error object. Since
        // tg-resources handles these errors in the GenericResource we need to only send
        // error object here if it is not due to a response code.
        //
        // Network errors in superagent don't have `err.status`

        return new SuperagentResponse(
            response,
            error && error.status === undefined ? error : null,
            disableDeserialize
        );
    }

    createRequest(method, url, query, data) {
        method = method.toLowerCase();

        let req = request[method](url);

        if (query) {
            req = req.query(query);
        }

        if (data) {
            req = req.send(data);
        }

        return req;
    }

    doRequest(req, resolve) {
        req.end((err, res) => {
            resolve(res, err);
        });
    }

    setHeader(req, key, value) {
        return req.set(key, value);
    }
}
