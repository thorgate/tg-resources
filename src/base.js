import renderTemplate from 'lodash.template';
import cookie from 'cookie';

import {getConfig, getExtraHeaders, getOnSourceError, getCookies} from './init';
import Response from './response';
import {InvalidResponseCode, NetworkError} from './errors';
import {isArray, isFunction, isObject, isString, hasValue} from './typeChecks';


class GenericResource {
    /**
     * @param apiEndpoint Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
     * @param expectedStatus Array (or a single value) of valid status codes. Default: 200
     * @param [mutateResponse] Function to mutate the response before resolving it. Signature: `response => response`
     * @param [errorStatus] Array (or a single value) of status codes to treat as ValidationError. Default: 400
     */
    constructor(apiEndpoint, expectedStatus, mutateResponse, errorStatus) {
        this.apiEndpoint = getConfig('API_BASE') + apiEndpoint;
        this.expectedStatus = expectedStatus || 200;
        this.errorStatus = errorStatus || 400;

        if (!isArray(this.expectedStatus)) {
            this.expectedStatus = [this.expectedStatus, ];
        }

        if (!isArray(this.errorStatus)) {
            this.errorStatus = [this.errorStatus, ];
        }

        if (isFunction(mutateResponse)) {
            this.mutateResponse = mutateResponse;
        }

        else {
            this.mutateResponse = response => response;
        }
    }

    getCookies() {
        let cookieVal = getCookies();

        if (cookieVal) {
            const pairs = [];

            Object.keys(cookieVal).forEach(key => {
                pairs.push(cookie.serialize(key, cookieVal[key]));
            });

            cookieVal = pairs.join('; ');
        }

        return cookieVal;
    }

    wrapResponse(res, error) {
        return new Response(res, error);
    }

    handleRequest(req) {
        return this.ensureStatusAndJson(new Promise((resolve) => {
            const headers = Object.assign({
                Accept: 'application/json'
            }, getExtraHeaders());

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
        return getOnSourceError(error);
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
