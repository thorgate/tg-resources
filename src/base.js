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

    config(requestConfig = null) {
        if (!this._config) {
            this._config = mergeConfig(
                this.parent ? this.parent.config() : DEFAULTS,
                this._customConfig,
            );
        }

        if (requestConfig && isObject(requestConfig)) {
            return mergeConfig(this._config, requestConfig);
        }

        return this._config;
    }

    mutateRawResponse(rawResponse, requestConfig) {
        const config = this.config(requestConfig);
        if (isFunction(config.mutateRawResponse)) {
            return config.mutateRawResponse(rawResponse, requestConfig);
        }

        return rawResponse;
    }

    mutateResponse(responseData, rawResponse, requestConfig) {
        const config = this.config(requestConfig);
        if (isFunction(config.mutateResponse)) {
            return config.mutateResponse(responseData, rawResponse, this, requestConfig);
        }

        return responseData;
    }

    mutateError(error, rawResponse, requestConfig) {
        const config = this.config(requestConfig);
        if (isFunction(config.mutateError)) {
            return config.mutateError(error, rawResponse, this, requestConfig);
        }

        return error;
    }

    getHeaders(requestConfig = null) {
        const config = this.config(requestConfig);
        const headers = {
            ...(this.parent ? this.parent.getHeaders() : {}),
            ...((isFunction(config.headers) ? config.headers() : config.headers) || {}),
        };

        const cookieVal = serializeCookies(this.getCookies(requestConfig));
        if (cookieVal) {
            headers.Cookie = cookieVal;
        }

        // if Accept is null/undefined, add default accept header automatically (backwards incompatible for text/html)
        if (!hasValue(headers.Accept)) {
            headers.Accept = config.defaultAcceptHeader;
        }

        return headers;
    }

    getCookies(requestConfig = null) {
        const config = this.config(requestConfig);
        return {
            ...(this.parent ? this.parent.getCookies() : {}),
            ...((isFunction(config.cookies) ? config.cookies() : config.cookies) || {}),
        };
    }

    handleRequest(req, requestConfig) {
        return this.ensureStatusAndJson(new Promise((resolve) => {
            const headers = this.getHeaders(requestConfig);

            if (headers && isObject(headers)) {
                Object.keys(headers).forEach((key) => {
                    if (hasValue(headers[key])) {
                        req = this.setHeader(req, key, headers[key]);
                    }
                });
            }

            this.doRequest(req, (response, error) => resolve(this.constructor.wrapResponse(response, error, req)));
        }), requestConfig);
    }

    ensureStatusAndJson(prom, requestConfig) {
        const config = this.config(requestConfig);
        return prom.then((origRes) => {
            const res = this.mutateRawResponse(origRes, requestConfig);

            // If no error occured
            if (res && !res.hasError) {
                if (config.statusSuccess.indexOf(res.status) !== -1) {
                    // Got statusSuccess response code, lets resolve this promise
                    return this.mutateResponse(res.data, res, requestConfig);
                } else if (config.statusValidationError.indexOf(res.status) !== -1) {
                    // Got statusValidationError response code, lets throw RequestValidationError
                    throw this.mutateError(
                        new RequestValidationError(res.status, res.text, config),
                        res,
                        requestConfig,
                    );
                } else {
                    // Throw a InvalidResponseCode error
                    throw this.mutateError(
                        new InvalidResponseCode(res.status, res.text),
                        res,
                        requestConfig,
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

    buildThePath(urlParams, requestConfig) {
        let thePath = this.apiEndpoint;
        const config = this.config(requestConfig);

        if (urlParams && !(isObject(urlParams) && Object.keys(urlParams).length === 0)) {
            thePath = renderTemplate(this.apiEndpoint)(urlParams);
        }

        return `${config.apiRoot}${thePath}`;
    }

    /* istanbul ignore next */
    static wrapResponse(res, error, req) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    createRequest(method, url, query, data, requestConfig) { // eslint-disable-line class-methods-use-this, no-unused-vars
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
