import { isArray, isObject, isString } from './typeChecks';
import { truncate } from './util';


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


export class ValidationError extends InvalidResponseCode {
    constructor(err, config = null, isPrepared = false) {
        if (isPrepared) {
            err = {
                responseText: err,
            };
        }

        err = {
            statusCode: 0,
            responseText: '',
            ...err,
        };

        super(err.statusCode, err.responseText, 'ValidationError');

        this._customConfig = config || {};

        const handler = this._customConfig.parseErrors || ValidationError.defaultParseErrors;
        const res = handler(err.responseText, this._customConfig);
        this.nonFieldErrors = res[0] || null;
        this.errors = res[1] || /* istanbul ignore next: can only happen w/ custom parseErrors */ {};
    }

    get isValidationError() { // eslint-disable-line class-methods-use-this
        return true;
    }

    get isInvalidResponseCode() { // eslint-disable-line class-methods-use-this
        return false;
    }

    getError(fieldName, allowNonFields) {
        if (this.errors[fieldName] || (allowNonFields && this.nonFieldErrors)) {
            return this.errors[fieldName] || this.nonFieldErrors;
        }

        return null;
    }

    firstError(allowNonField) {
        if (allowNonField && this.nonFieldErrors) {
            return this.nonFieldErrors;
        }

        const errs = Object.keys(this.errors);

        if (errs.length > 0) {
            return this.errors[errs[0]];
        }

        return null;
    }

    static defaultParseErrors(errorText, parentConfig) {
        if (isString(errorText)) {
            if (errorText) {
                errorText = JSON.parse(errorText);
            } else {
                errorText = {};
            }
        }

        let resNonField = null;
        const resErrors = {};

        const prepareError = parentConfig.prepareError || ValidationError.defaultPrepareError;

        const errors = typeof errorText.errors === 'undefined' ? errorText : errorText.errors;
        Object.keys(errors).forEach((key) => {
            if (key === 'non_field_errors') {
                resNonField = prepareError(errors[key], parentConfig);
            }
            else {
                resErrors[key] = prepareError(errors[key], parentConfig);
            }
        });

        return [resNonField, resErrors];
    }

    static defaultPrepareError(err, parentConfig) {
        if (isString(err)) {
            return err;
        }

        else if (isArray(err)) {
            return err.join(', ');
        }

        else if (isObject(err)) {
            // Note: We clone the object just in case
            return new ValidationError(Object.assign({}, err), parentConfig, true);
        }

        else {
            return `${err}`;
        }
    }
}
