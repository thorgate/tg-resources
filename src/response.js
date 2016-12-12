
export class ResponseWrapper {
    constructor(response, error, disableDeserialize) {
        this.response = response || {};
        this._error = error;
        this.disableDeserialize = disableDeserialize;
    }

    get hasError() {
        return !!this._error;
    }

    get error() {
        return this._error;
    }

    /* istanbul ignore next */
    get status() {
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get statusType() {
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get text() {
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get data() {
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get headers() {
        throw new Error('Not implemented');
    }
}


export default ResponseWrapper;
