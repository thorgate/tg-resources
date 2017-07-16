
class ResponseWrapper {
    constructor(response, error) {
        this._response = response;
        this._error = error;
    }

    get response() {
        return this._response || /* istanbul ignore next: safeguard */ {};
    }

    get error() {
        return this._error;
    }

    get hasError() {
        return !!this.error;
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
