import is from 'is';
import _ from 'lodash';
import cookie from 'cookie';

import {getConfig, getExtraHeaders, getOnSourceError, getCookies} from './init';
import Response from './response';
import {InvalidResponseCode} from './errors';


class GenericResource {
    /**
     *
     * @param apiEndpoint String value which supports syntax of _.template
     * @param expectedStatus
     * @param [mutateResponse] Function to modify the response before resolving it
     */
    constructor(apiEndpoint, expectedStatus, mutateResponse) {
        this.apiEndpoint = getConfig('API_BASE') + apiEndpoint;
        this.expectedStatus = expectedStatus || 200;

        if (!is.array(this.expectedStatus)) {
            this.expectedStatus = [this.expectedStatus, ];
        }

        if (is.fn(mutateResponse)) {
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
            const headers = _.extend({
                Accept: 'application/json'
            }, getExtraHeaders());

            const cookieVal = this.getCookies();
            if (cookieVal) {
                headers.Cookie = cookieVal;
            }

            if (headers && is.object(headers)) {
                Object.keys(headers).forEach(key => {
                    if (is.defined(headers[key]) && !is.nil(headers[key])) {
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
                    // Throw a InvalidResponseCode error
                    throw new InvalidResponseCode(res.status, res.statusType, res.text);
                }

                else {
                    // Throw a Generic error since the request failed
                    throw res.error || new Error('Something went awfully wrong with the request, check network log.');
                }
            }
        }).catch((error) => {
            // Rethrow any errors
            throw error;
        });
    }

    buildThePath(urlParams) {
        let thePath = this.apiEndpoint;

        if (urlParams && !(is.object(urlParams) && Object.keys(urlParams).length === 0)) {
            thePath = _.template(this.apiEndpoint)(urlParams);
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
