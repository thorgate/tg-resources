import { hasValue } from './typeChecks';
import { truncate } from './util';
import { parseErrors, prepareError } from './validationError';


export class BaseResourceError {
    constructor(message) {
        this._message = message;
    }

    toString() {
        return this._message;
    }

    get isNetworkError() { // eslint-disable-line class-methods-use-this
        return false;
    }

    get isInvalidResponseCode() { // eslint-disable-line class-methods-use-this
        return false;
    }

    get isValidationError() { // eslint-disable-line class-methods-use-this
        return false;
    }
}

export class NetworkError extends BaseResourceError {
    constructor(error) {
        super('NetworkError');

        this.error = error;
    }

    get isNetworkError() { // eslint-disable-line class-methods-use-this
        return true;
    }
}

export class InvalidResponseCode extends BaseResourceError {
    constructor(statusCode, responseText, type = 'InvalidResponseCode') {
        super(`${type} ${statusCode}: ${truncate(responseText, 256)}`);

        this.statusCode = statusCode;
        this.responseText = responseText;
    }

    get isInvalidResponseCode() { // eslint-disable-line class-methods-use-this
        return true;
    }
}

export class RequestValidationError extends InvalidResponseCode {
    constructor(statusCode, responseText, config = null) {
        super(statusCode, responseText, 'RequestValidationError');

        // Set custom config
        this._customConfig = {
            parseErrors,
            prepareError,
            ...config || {},
        };

        // parse response body as a ValidationError
        this._errors = this._customConfig.parseErrors(responseText, this._customConfig);
    }

    // public api
    get isValidationError() { // eslint-disable-line class-methods-use-this
        return true;
    }

    get isInvalidResponseCode() { // eslint-disable-line class-methods-use-this
        return false;
    }

    get errors() {
        return this._errors;
    }

    hasError() {
        return hasValue(this._errors) && this._errors.hasError();
    }
}
