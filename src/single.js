export default function makeSingle(baseClass) {
    class SingleObjectResource extends baseClass {
        fetch(kwargs, query, method = 'get') {
            const thePath = this.buildThePath(kwargs);
            return this.handleRequest(this.createRequest(method, thePath, query));
        }

        head(kwargs, query) {
            return this.fetch(kwargs, query, 'head');
        }

        options(kwargs, query) {
            return this.fetch(kwargs, query, 'options');
        }

        post(kwargs, data, query, method = 'post') {
            const thePath = this.buildThePath(kwargs);

            return this.handleRequest(this.createRequest(method, thePath, query, data || {}));
        }

        patch(kwargs, data, query) {
            return this.post(kwargs, data, query, 'patch');
        }

        put(kwargs, data, query) {
            return this.post(kwargs, data, query, 'put');
        }

        del(kwargs, data, query) {
            return this.post(kwargs, data, query, 'del');
        }
    }

    return SingleObjectResource;
}
