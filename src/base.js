import renderTemplate from 'lodash.template';
import cookie from 'cookie';

import Response from './response';

import {InvalidResponseCode, NetworkError} from './errors';
import {isArray, isFunction, isObject, isString, hasValue} from './typeChecks';


class GenericResource {
    /**
     * @param apiEndpoint Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
     * @param options Customize options for this resource (see `Router.options`)
     */
    constructor(apiEndpoint, options) {
        this.apiEndpoint = getConfig('API_BASE') + apiEndpoint;

        // Set options
        this._customOptions = options;

        // set parent to null
        this._parent = null;
    }

    setParent(parent) {
        this._parent = parent;
    }

    get isBound() {
        return !!this._parent || !!this._options;
    }

    get options() {
        if (!this._options) {
            return Router.mergeOptions(
                Router.DEFAULT_OPTIONS,
                this._parent ? this._parent.options : null,
                this._customOptions
            );
        }

        return this._options;
    }

    mutateResponse(response) {
        if (isFunction(this.options.mutateResponse)) {
            return this.options.mutateResponse(response);
        }

        return response;
    }

    getCookies() {
        let cookieVal = null;

        if (isFunction(this.options.cookies)) {
            cookieVal = this.options.cookies();
        }

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
            // Check expected status & error
            if (res && !res.hasError && this.expectedStatus.indexOf(res.status) !== -1) {
                return this.mutateResponse(res.body);
            }

            else {
                if (res) {
                    if (res.hasError) {
                        throw new NetworkError(res.error);
                    } else {
                        // Throw a InvalidResponseCode error
                        throw new InvalidResponseCode(res.status, res.statusType, res.text);
                    }
                }

                else {
                    // Throw a Generic error since the request failed
                    throw new NetworkError('Something went awfully wrong with the request, check network log.');
                }
            }
        }).catch((error) => {
            // Rethrow any errors
            throw error;
        });
    }

    buildThePath(urlParams) {
        let thePath = this.apiEndpoint;

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
