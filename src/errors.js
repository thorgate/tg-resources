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
        this.errors = {};
        this.nonFieldErrors = null;

        this.__parseErrors(err.responseText);
    }

    get isValidationError() { // eslint-disable-line class-methods-use-this
        return true;
    }

    get isInvalidResponseCode() { // eslint-disable-line class-methods-use-this
        return false;
    }

    getError(fieldName, allowNonFields) {
        if (this.errors[fieldName] || (allowNonFields && this.nonFieldErrors)) {
            return this.errors[fieldName] || this.nonFieldErrors || null;
        }

        return null;
    }

    /**
     * @deprecated Will be removed in the future
     */
    getFieldError(fieldName, allowNonField) {
        return this.getError(fieldName, allowNonField);
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

    __prepareError(err) {
        return ((this._customConfig ? this._customConfig.prepareError : null) || ValidationError.defaultPrepareError)(err, this);
    }

    __parseErrors(errorText) {
        const handler = (this._customConfig ? this._customConfig.parseErrors : null) || ValidationError.defaultParseErrors;
        const result = handler(errorText, this);

        this.nonFieldErrors = result[0];
        this.errors = result[1];
    }

    static defaultParseErrors(errorText, instance) {
        if (isString(errorText)) {
            if (errorText) {
                errorText = JSON.parse(errorText);
            } else {
                errorText = {};
            }
        }

        let resNonField = null;
        const resErrors = {};

        const errors = typeof errorText.errors === 'undefined' ? errorText : errorText.errors;
        Object.keys(errors).forEach((key) => {
            if (key === 'non_field_errors') {
                resNonField = instance.__prepareError(errors[key]);
            }

            else {
                resErrors[key] = instance.__prepareError(errors[key]);
            }
        });

        return [resNonField, resErrors];
    }

    static defaultPrepareError(err, instance) {
        if (isString(err)) {
            return err;
        }

        else if (isArray(err)) {
            return err.join(', ');
        }

        else if (isObject(err)) {
            // Note: We clone the object just in case
            return new ValidationError(Object.assign({}, err), instance ? instance._customConfig : null, true);
        }

        else {
            return `${err}`;
        }
    }
}
