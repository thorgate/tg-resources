import renderTemplate from 'lodash.template';

import DEFAULTS from './constants';
import { InvalidResponseCode, NetworkError, ValidationError } from './errors';
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
            return mergeConfig(
                DEFAULTS,
                this._parent ? this._parent.config : null,
                this._customConfig,
            );
        }

        return this._config;
    }

    mutateResponse(responseData, response) {
        if (isFunction(this.config.mutateResponse)) {
            return this.config.mutateResponse(responseData, response, this);
        }

        return responseData;
    }

    getHeaders() {
        const headers = {
            ...(this.config.defaultHeaders || {}),
            ...((isFunction(this.config.headers) ? this.config.headers() : this.config.headers) || {}),
        };

        const cookieVal = serializeCookies(this.getCookies());
        if (cookieVal) {
            headers.Cookie = cookieVal;
        }

        return headers;
    }

    getCookies() {
        return {
            ...(this._parent ? this._parent.getCookies() : {}),
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

            this.doRequest(req, (response, error) => resolve(this.wrapResponse(response, error, req)));
        }));
    }

    ensureStatusAndJson(prom) {
        return prom.then((res) => {
            // If no error occured
            if (res && !res.hasError) {
                if (this.config.statusSuccess.indexOf(res.status) !== -1) {
                    // Got statusSuccess response code, lets resolve this promise
                    return this.mutateResponse(res.data, res);
                } else if (this.config.statusValidationError.indexOf(res.status) !== -1) {
                    // Got statusValidationError response code, lets throw ValidationError
                    throw new ValidationError({
                        statusCode: res.status,
                        responseText: res.text,
                    }, this.config);
                } else {
                    // Throw a InvalidResponseCode error
                    throw new InvalidResponseCode(res.status, res.text);
                }
            } else {
                // res.hasError should only be true if network level errors occur (not statuscode errors)
                const message = res && res.hasError ? res.error : '';
                throw new NetworkError(message || 'Something went awfully wrong with the request, check network log.');
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
    wrapResponse(res, error, req) { // eslint-disable-line class-methods-use-this, no-unused-vars
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
