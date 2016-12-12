
class ResponseWrapper {
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
    get status() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get statusType() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get text() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get data() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }

    /* istanbul ignore next */
    get headers() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }
}


export default ResponseWrapper;
