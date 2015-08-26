import is from 'is';



export class InvalidResponseCode extends Error {
    constructor(statusCode, statusText, responseText) {
        super(`InvalidResponseCode ${statusCode}: ${statusText}`);

        this.statusCode = statusCode;
        this.statusText = statusText;
        this.responseText = responseText;
    }
}


export class ValidatonError extends InvalidResponseCode {
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
        if (is.string(errorText)) {
            errorText = JSON.parse(errorText);
        }

        Object.keys(errorText.errors).forEach((key) => {
            if (key === 'non_field_errors') {
                this.nonFieldErrors = ValidatonError.prepareError(errorText.errors[key]);
            }

            else {
                this.errors[key] = ValidatonError.prepareError(errorText.errors[key]);
            }
        });
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
