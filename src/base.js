import is from 'is';
import _ from 'lodash';

import {getConfig, getCsrfToken, getExtraHeaders, getOnSourceError} from './init';
import Response from './response';


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
            this.mutateResponse = null;
        }
    }

    wrapResponse(res) {
        return new Response(res);
    }

    handleRequest(req) {
        return this.ensureStatusAndJson(new Promise((resolve) => {
            const headers = _.extend({
                Accept: 'application/json',
                'X-CSRFToken': getCsrfToken()
            }, getExtraHeaders());

            if (headers && is.object(headers)) {
                Object.keys(headers).forEach(key => {
                    if (is.defined(headers[key]) && !is.nil(headers[key])) {
                        req = this.setHeader(req, key, headers[key]);
                    }
                });
            }

            this.doRequest(req, response => resolve(this.wrapResponse(response)));
        }));
    }

    ensureStatusAndJson(prom) {
        return prom.then((res) => {
            // Check expected status
            if (res && this.expectedStatus.indexOf(res.status) !== -1) {
                return res.body;
            }

            else {
                if (res) {
                    // Throw a InvalidResponseCode error
                    throw new InvalidResponseCode(res.status, res.statusType, res.text);
                }

                else {
                    // Throw a Generic error since the request failed
                    throw new Error('Something went awfully wrong with the request, check network log.');
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
