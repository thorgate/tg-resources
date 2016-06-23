import renderTemplate from 'lodash.template';
import cookie from 'cookie';

import Response from './response';

import {DEFAULT_OPTIONS} from './constants';
import {InvalidResponseCode, NetworkError} from './errors';
import {isArray, isFunction, isObject, isString, hasValue} from './typeChecks';
import {mergeOptions} from './util';


class GenericResource {
    /**
     * @param apiEndpoint Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
     * @param options Customize options for this resource (see `Router.options`)
     */
    constructor(apiEndpoint, options) {
        this.apiEndpoint = apiEndpoint;

        // Set options
        this._customOptions = options;

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
        return !!this._parent || !!this._options;
    }

    get options() {
        if (!this._options) {
            return mergeOptions(
                DEFAULT_OPTIONS,
                this._parent ? this._parent.options : null,
                this._customOptions
            );
        }

        return this._options;
    }

    mutateResponse(responseData, response) {
        if (isFunction(this.options.mutateResponse)) {
            return this.options.mutateResponse(responseData, response, this);
        }

        return responseData;
    }

    getCookies() {
        let cookieVal = {
            ...(this._parent ? this._parent.getCookies() : {}),
            ...(isFunction(this.options.cookies) ? this.options.cookies() : {})
        };

        if (isObject(cookieVal)) {
            const pairs = [];

            Object.keys(cookieVal).forEach(key => {
                pairs.push(cookie.serialize(key, cookieVal[key]));
            });

            cookieVal = pairs.join('; ');
        }

        return cookieVal || null;
    }

    wrapResponse(res, error) {
        return new Response(res, error);
    }

    handleRequest(req) {
        return this.ensureStatusAndJson(new Promise((resolve) => {
            const headers = Object.assign({},
                this.options.defaultHeader || {},
                (isFunction(this.options.headers) ? this.options.headers() : this.options.headers) || {}
            );

            const cookieVal = this.getCookies();
            if (cookieVal) {
                headers.Cookie = cookieVal;
            }

            if (headers && isObject(headers)) {
                Object.keys(headers).forEach(key => {
                    if (hasValue(headers[key])) {
                        req = this.setHeader(req, key, headers[key]);
                    }
                });
            }

            this.doRequest(req, (response, error) => resolve(this.wrapResponse(response, error)));
        }));
    }

    ensureStatusAndJson(prom) {
        return prom.then((res) => {
            // If no error occured
            if (res && !res.hasError) {
                if (this.options.statusSuccess.indexOf(res.status) !== -1) {
                    // Got statusSuccess response code, lets resolve this promise
                    return this.mutateResponse(res.data, res);
                } else {
                    if (this.options.statusValidationError.indexOf(res.status) !== -1) {
                        // Got statusValidationError response code, lets throw ValidationError
                        throw new ValidationError(res, this.options);
                    } else {
                        // Throw a InvalidResponseCode error
                        throw new InvalidResponseCode(res.status, res.statusType, res.text);
                    }
                }
            } else {
                // res.hasError should only be true if network level errors occur (not statuscode errors)
                throw new NetworkError(
                    res && res.hasError ?
                        res.error :
                        'Something went awfully wrong with the request, check network log.'
                );
            }
        }).catch((error) => {
            // Rethrow any errors
            throw error;
        });
    }

    buildThePath(urlParams) {
        let thePath = `${this.options.apiRoot}${this.apiEndpoint}`;

        if (urlParams && !(isObject(urlParams) && Object.keys(urlParams).length === 0)) {
            thePath = renderTemplate(this.apiEndpoint)(urlParams);
        }

        return thePath;
    }

    onSourceError(error) {
        return this.options.onSourceError(error);
    }

    createRequest(method, url, query, data) {
        throw new Error('Not implemented');
    }

    doRequest(req, resolve) {
        throw new Error('Not implemented');
    }

    setHeader(req, key, value) {
        throw new Error('Not implemented');
    }
}

export default GenericResource;
