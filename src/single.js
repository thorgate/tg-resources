export default function makeSingle(baseClass) {
    class SingleObjectResource extends baseClass {
        fetch(kwargs, query, requestConfig = null, method = 'get') {
            const thePath = this.buildThePath(kwargs, requestConfig);
            return this.handleRequest(this.createRequest(method, thePath, query, null, null, requestConfig), requestConfig);
        }

        head(kwargs, query, requestConfig = null) {
            return this.fetch(kwargs, query, requestConfig, 'head');
        }

        options(kwargs, query, requestConfig = null) {
            return this.fetch(kwargs, query, requestConfig, 'options');
        }

        post(kwargs, data, query, attachments, requestConfig = null, /* istanbul ignore next: https://github.com/istanbuljs/babel-plugin-istanbul/issues/94 */ method = 'post') {
            const thePath = this.buildThePath(kwargs, requestConfig);

            return this.handleRequest(
                this.createRequest(method, thePath, query, data || {}, attachments, requestConfig), requestConfig,
            );
        }

        patch(kwargs, data, query, attachments, requestConfig = null) {
            return this.post(kwargs, data, query, attachments, requestConfig, 'patch');
        }

        put(kwargs, data, query, attachments, requestConfig = null) {
            return this.post(kwargs, data, query, attachments, requestConfig, 'put');
        }

        del(kwargs, data, query, attachments, requestConfig = null) {
            return this.post(kwargs, data, query, attachments, requestConfig, 'del');
        }
    }

    return SingleObjectResource;
}
