import renderTemplate from 'lodash.template';

import DEFAULTS from './constants';
import { InvalidResponseCode, NetworkError, RequestValidationError } from './errors';
import { isFunction, isObject, hasValue } from './typeChecks';
import { mergeConfig, serializeCookies } from './util';


class GenericResource {
    /**
     * @param apiEndpoint Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
     * @param config Customize config for this resource (see `Router.config`)
     */
    constructor(apiEndpoint, config) {
        this.apiEndpoint = apiEndpoint;

        // Set config
        this._customConfig = config;

        // set parent to null
        this._parent = null;
    }

    get parent() {
        return this._parent;
    }

    _setParent(parent) {
        this._parent = parent;
    }

    get isBound() {
        return !!this._parent || !!this._config;
    }

    get config() {
        if (!this._config) {
            this._config = mergeConfig(
                this.parent ? this.parent.config : DEFAULTS,
                this._customConfig,
            );
        }

        return this._config;
    }

    mutateRawResponse(rawResponse) {
        if (isFunction(this.config.mutateRawResponse)) {
            return this.config.mutateRawResponse(rawResponse);
        }

        return rawResponse;
    }

    mutateResponse(responseData, rawResponse) {
        if (isFunction(this.config.mutateResponse)) {
            return this.config.mutateResponse(responseData, rawResponse, this);
        }

        return responseData;
    }

    mutateError(error, rawResponse) {
        if (isFunction(this.config.mutateError)) {
            return this.config.mutateError(error, rawResponse, this);
        }

        return error;
    }

    getHeaders() {
        const headers = {
            ...(this.parent ? this.parent.getHeaders() : {}),
            ...((isFunction(this.config.headers) ? this.config.headers() : this.config.headers) || {}),
        };

        const cookieVal = serializeCookies(this.getCookies());
        if (cookieVal) {
            headers.Cookie = cookieVal;
        }

        // if Accept is null/undefined, add default accept header automatically (backwards incompatible for text/html)
        if (!hasValue(headers.Accept)) {
            headers.Accept = this.config.defaultAcceptHeader;
        }

        return headers;
    }

    getCookies() {
        return {
            ...(this.parent ? this.parent.getCookies() : {}),
            ...((isFunction(this.config.cookies) ? this.config.cookies() : this.config.cookies) || {}),
        };
    }

    handleRequest(req) {
        return this.ensureStatusAndJson(new Promise((resolve) => {
            const headers = this.getHeaders();

            if (headers && isObject(headers)) {
                Object.keys(headers).forEach((key) => {
                    if (hasValue(headers[key])) {
                        req = this.setHeader(req, key, headers[key]);
                    }
                });
            }

            this.doRequest(req, (response, error) => resolve(this.constructor.wrapResponse(response, error, req)));
        }));
    }

    ensureStatusAndJson(prom) {
        return prom.then((origRes) => {
            const res = this.mutateRawResponse(origRes);

            // If no error occured
            if (res && !res.hasError) {
                if (this.config.statusSuccess.indexOf(res.status) !== -1) {
                    // Got statusSuccess response code, lets resolve this promise
                    return this.mutateResponse(res.data, res);
                } else if (this.config.statusValidationError.indexOf(res.status) !== -1) {
                    // Got statusValidationError response code, lets throw RequestValidationError
                    throw this.mutateError(
                        new RequestValidationError({
                            statusCode: res.status,
                            responseText: res.text,
                        }, this.config),
                        res,
                    );
                } else {
                    // Throw a InvalidResponseCode error
                    throw this.mutateError(
                        new InvalidResponseCode(res.status, res.text),
                        res,
                    );
                }
            } else {
                // res.hasError should only be true if network level errors occur (not statuscode errors)
                const message = res && res.hasError ? res.error : '';

                throw this.mutateError(
                    new NetworkError(message || 'Something went awfully wrong with the request, check network log.'),
                    res,
                );
            }
        });
    }

    buildThePath(urlParams) {
        let thePath = this.apiEndpoint;

        if (urlParams && !(isObject(urlParams) && Object.keys(urlParams).length === 0)) {
            thePath = renderTemplate(this.apiEndpoint)(urlParams);
        }

        return `${this.config.apiRoot}${thePath}`;
    }

    /* istanbul ignore next */
    static wrapResponse(res, error, req) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    createRequest(method, url, query, data) { // eslint-disable-line class-methods-use-this, no-unused-vars
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    doRequest(req, resolve) { // eslint-disable-line class-methods-use-this, no-unused-vars
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    setHeader(req, key, value) { // eslint-disable-line class-methods-use-this, no-unused-vars
        throw new Error('Not implemented');
    }
}

export default GenericResource;
