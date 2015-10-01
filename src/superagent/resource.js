import ResponseWrapper from '../response';
import GenericResource from '../base';
import request from 'superagent';


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

    get body() {
        return this.response.body;
    }
}

export class SuperAgentResource extends GenericResource {
    wrapResponse(res) {
        return new SuperagentResponse(res);
    }

    createRequest(method, url, query, data) {
        method = method.toLowerCase();

        let reg = request[method](url);

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
            resolve(res);
        });
    }

    setHeader(req, key, value) {
        return req.set(key, value);
    }
}
