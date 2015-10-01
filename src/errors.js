import is from 'is';

import {getConfig} from './init';


export class InvalidResponseCode extends Error {
    constructor(statusCode, statusText, responseText) {
        super(`InvalidResponseCode ${statusCode}: ${statusText}`);

        this.statusCode = statusCode;
        this.statusText = statusText;
        this.responseText = responseText;
    }
}


export class ValidationError extends InvalidResponseCode {
    constructor(err) {
        super(err.statusCode, err.statusText, err.responseText);

        this.errors = {};
        this.nonFieldErrors = null;

        this.__parseErrors(err.responseText);
    }

    getFieldError(fieldName, allowNonFields) {
        if (this.errors[fieldName] || (allowNonFields && this.nonFieldErrors)) {
            return this.errors[fieldName] || this.nonFieldErrors;
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
        if (is.string(errorText)) {
            errorText = JSON.parse(errorText);
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
        if (is.string(err)) {
            return err;
        }

        else if (is.array(err)) {
            return err.join(', ');
        }

        else if (is.object(err)) {
            // Note: This is a bad way to return perField errors
            return JSON.stringify(err);
        }

        else {
            return err + '';
        }
    }
}
