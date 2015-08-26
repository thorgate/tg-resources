
export default function makeSingle(baseClass) {
    class SingleObjectResource extends baseClass {
        static STATUS_CODE = [200, 201];

        constructor(apiEndpoint, expectedStatus, mutateResponse) {
            if (!expectedStatus) {
                expectedStatus = SingleObjectResource.STATUS_CODE;
            }

            super(apiEndpoint, expectedStatus, mutateResponse);
        }

        // TODO: Add delete, head

        fetch(kwargs, query) {
            const thePath = this.buildThePath(kwargs);

            return this.handleRequest(this.createRequest('get', thePath, query))
                .then(response => response)
                .catch((err) => {
                    throw err;
                });
        }

        post(kwargs, data, query, method='post') {
            const thePath = this.buildThePath(kwargs);

            return this.handleRequest(this.createRequest(method, thePath, query, data || {}))
                .then(response => response)
                .catch((err) => {
                    if (err instanceof InvalidResponseCode) {
                        if (err.statusCode === 400) {
                            throw new ValidatonError(err);
                        }
                    }

                    throw err;
                });
        }

        patch(kwargs, data, query) {
            return this.post(kwargs, data, query, 'patch');
        }

        put(kwargs, data, query) {
            return this.post(kwargs, data, query, 'put');
        }

        sourcePost(kwargs, data, query, uuid, errCb) {
            return new Promise((resolve, reject) => {
                this.post(kwargs, data, query).then(response => {
                    if (uuid) {
                        resolve({data: response, uuid: uuid});
                    } else {
                        resolve(response);
                    }
                }).catch(error => {
                    // If we get something other than 400, lets trigger errCb|this.onSourceError
                    if (error.statusCode !== 400) {
                        (errCb || this.onSourceError)(error);
                    }

                    // Also reject
                    reject({error, postData});
                });
            });
        }
    }

    return SingleObjectResource;
}
