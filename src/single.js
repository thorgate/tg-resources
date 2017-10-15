export default function makeSingle(baseClass) {
    class SingleObjectResource extends baseClass {
        fetch(kwargs, query, requestConfig = null, method = 'get') {
            const thePath = this.buildThePath(kwargs, requestConfig);
            return this.handleRequest(this.createRequest(method, thePath, query), requestConfig);
        }

        head(kwargs, query, requestConfig = null) {
            return this.fetch(kwargs, query, requestConfig, 'head');
        }

        options(kwargs, query, requestConfig = null) {
            return this.fetch(kwargs, query, requestConfig, 'options');
        }

        post(kwargs, data, query, requestConfig = null, /* istanbul ignore next: https://github.com/istanbuljs/babel-plugin-istanbul/issues/94 */ method = 'post') {
            const thePath = this.buildThePath(kwargs, requestConfig);

            return this.handleRequest(this.createRequest(method, thePath, query, data || {}), requestConfig);
        }

        patch(kwargs, data, query, requestConfig = null) {
            return this.post(kwargs, data, query, requestConfig, 'patch');
        }

        put(kwargs, data, query, requestConfig = null) {
            return this.post(kwargs, data, query, requestConfig, 'put');
        }

        del(kwargs, data, query, requestConfig = null) {
            return this.post(kwargs, data, query, requestConfig, 'del');
        }
    }

    return SingleObjectResource;
}
