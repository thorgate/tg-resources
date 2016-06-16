import {getConfig} from './init';
import {isArray, isObject, isString} from './typeChecks';


export class BaseResourceError {
    constructor(message) {
        this._message = message;
    }

    toString() {
        return this._message;
    }

    get isNetworkError() {
        return false;
    }

    get isInvalidResponseCode() {
        return false;
    }

    get isValidationError() {
        return false;
    }
}

export class NetworkError extends BaseResourceError {
    constructor(error) {
        super(`NetworkError`);

        this.error = error;
    }

    get isNetworkError() {
        return true;
    }
}

export class InvalidResponseCode extends BaseResourceError {
    constructor(statusCode, statusText, responseText, type='InvalidResponseCode') {
        super(`${type} ${statusCode}: ${statusText}`);

        this.statusCode = statusCode;
        this.statusText = statusText;
        this.responseText = responseText;
    }

    get isInvalidResponseCode() {
        return true;
    }
}

function addExtraFields(instance) {
    const extras = getConfig('ValidationErrorExtras');
    Object.keys(extras).forEach(key => {
        instance[key] = function() {
            return extras[key].apply(this, arguments);
        };
    });
}


class BaseValidationError extends InvalidResponseCode {
    constructor(err) {
        err = {
            statusCode: 0,
            statusText: 'Unknown',
            responseText: '',
            ...err
        };

        super(err.statusCode, err.statusText, err.responseText, 'ValidationError');

        this.errors = {};
        this.nonFieldErrors = null;

        addExtraFields(this);

        this.__parseErrors(err.responseText);
    }

    get isValidationError() {
        return true;
    }

    get isInvalidResponseCode() {
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

    __parseErrors(errorText) {
        const handler = getConfig('parseErrors') || ValidationError.defaultParseErrors;

        const result = handler(errorText);

        this.nonFieldErrors = result[0];
        this.errors = result[1];
    }

    static defaultParseErrors(errorText) {
        if (isString(errorText)) {
            if (errorText) {
                errorText = JSON.parse(errorText);
            } else {
                errorText = {};
            }
        }

        let resNonField = null;
        const resErrors = {};

        const errors = typeof errorText.errors === "undefined" ? errorText : errorText.errors;
        Object.keys(errors).forEach((key) => {
            if (key === 'non_field_errors') {
                resNonField = ValidationError.prepareError(errors[key]);
            }

            else {
                resErrors[key] = ValidationError.prepareError(errors[key]);
            }
        });

        return [resNonField, resErrors];
    }

    static prepareError(err) {
        if (isString(err)) {
            return err;
        }

        else if (isArray(err)) {
            return err.join(', ');
        }

        else if (isObject(err)) {
            // Note: This is a bad way to return perField errors
            return JSON.stringify(err);
        }

        else {
            return err + '';
        }
    }
}

export const ValidationError = BaseValidationError;
