import { isArray, isString, isObject, hasValue } from './typeChecks';


const ErrorIterator = function (instance) {
    let curKey = 0;

    return {
        next() {
            const nextVal = instance.errorByIndex(curKey);

            // Note: If a custom error handler does not coerce undefined to null,
            //  the iterator will stop too early
            //
            // Feel free to submit a PR if this annoys you!
            if (nextVal === undefined) {
                return { done: true };
            } else {
                curKey += 1;

                return {
                    value: nextVal,
                };
            }
        },
    };
};

const bindAndCoerce = (error, fieldName) => {
    const res = error || null;

    if (res !== null) {
        res.bindToField(fieldName);
    }

    return res;
};

export class ValidationErrorInterface {
    constructor(errors) {
        // Store errors
        this._errors = errors;
    }

    get errors() {
        return this._errors;
    }

    // Support for .. of loops
    [Symbol.iterator]() {
        return ErrorIterator(this);
    }

    /**
     * Iterator used for .forEach/.filter/.map
     */
    _iter() { // eslint-disable-line class-methods-use-this
        return this._errors;
    }

    /**
     * Used by firstError and iteration protocol
     */
    errorByIndex(index) { // eslint-disable-line class-methods-use-this
        return this._errors[index];
    }

    /* istanbul ignore next: just an interface */
    hasError() { // eslint-disable-line class-methods-use-this
        return 'ValidationErrorInterface::asString is not implemented';
    }

    bindToField(fieldName) {
        // istanbul ignore else: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            if (this.fieldName && this.fieldName !== fieldName) {
                // eslint-disable-next-line no-console
                console.error(`ValidationErrorInterface: Unexpected rebind of ${this} as ${fieldName} (was ${this.fieldName})`);
            }
        }

        this.fieldName = fieldName;
    }

    /* istanbul ignore next: just an interface */
    asString() { // eslint-disable-line class-methods-use-this
        return 'ValidationErrorInterface::asString is not implemented';
    }

    toString() {
        return this.asString();
    }

    map(...rest) {
        return this._iter().map(...rest);
    }

    forEach(...rest) {
        return this._iter().forEach(...rest);
    }

    filter(...rest) {
        return this._iter().filter(...rest);
    }
}

export class SingleValidationError extends ValidationErrorInterface {
    constructor(errors) {
        // istanbul ignore else: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            if (!isArray(errors) || errors.filter(x => !isString(x)).length > 0) {
                // eslint-disable-next-line no-console
                console.error('SingleValidationError: `errors` argument must be an array of strings');
            }
        }

        super(errors);
    }

    hasError() {
        return this._errors.length > 0;
    }

    asString(glue = ' ') {
        return this._errors.join(glue || '');
    }
}

export class ParentValidationErrorInterface extends ValidationErrorInterface {
    // If null, there are no nonFieldErrors
    //
    // Some parent validation errors cannot have nonFieldErrors (e.g. ListValidationError,
    //  since a list cannot have attributes in JSON). Helps keep things DRY, since the result
    //  of getError & firstError won't change if nonFieldErrors is always null.
    nonFieldErrors = null;

    getError(fieldName, allowNonFields) {
        if (this.errors[fieldName] || (allowNonFields && this.nonFieldErrors)) {
            return this.errors[fieldName] || this.nonFieldErrors || null;
        }

        return null;
    }

    firstError(allowNonField) {
        if (allowNonField && this.nonFieldErrors) {
            return this.nonFieldErrors;
        }

        return this.errorByIndex(0) || null;
    }
}

export class ListValidationError extends ParentValidationErrorInterface {
    constructor(errors) {
        // istanbul ignore else: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            // Takes: anything thats not a ValidationError (besides null)
            const filterFn = (x) => {
                if (x === null) {
                    return false;
                }

                return !x || !(x instanceof ValidationErrorInterface);
            };

            if (errors) {
                if (!isArray(errors) || errors.filter(filterFn).length > 0) {
                    /* eslint-disable no-console */
                    console.error('ListValidationError: `errors argument` must be an array of ValidationErrorInterface? instances');
                    console.error('    Supported Builtins: null/SingleValidationError/ListValidationError/ValidationError');
                    /* eslint-enable no-console */
                }
            }
        }

        // MAP: falsy to null, bind all errors w/ their fieldName
        super((errors || []).map(bindAndCoerce));
    }

    hasError() {
        return this._errors
            .filter(x => x && x.hasError && x.hasError()).length > 0;
    }

    asString(glue = '; ') {
        return this._errors.map((value, key) => `${key}: ${value.asString()}`)
                           .join(glue);
    }
}

export class ValidationError extends ParentValidationErrorInterface {
    constructor(errors, nonFieldErrors) {
        // istanbul ignore else: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            // Takes: anything thats not a ValidationError (besides null)
            const filterFn = (key) => {
                if (errors[key] === null) {
                    return false;
                }

                return !errors[key] || !(errors[key] instanceof ValidationErrorInterface);
            };

            if (errors) {
                if (!isObject(errors) || Object.keys(errors).filter(filterFn).length > 0) {
                    /* eslint-disable no-console */
                    console.error('ListValidationError: `errors argument` must be an object of ValidationErrorInterface? instances');
                    console.error('    Supported Builtins: null/SingleValidationError/ListValidationError/ValidationError');
                    /* eslint-enable no-console */
                }
            }
        }

        // MAP: falsy to null, bind all errors w/ their fieldName
        const mutErrors = {};
        Object.keys(errors || {}).forEach((fieldName) => {
            mutErrors[fieldName] = bindAndCoerce(errors[fieldName], fieldName);
        });

        super(mutErrors);

        // Bind nonFieldErrors
        this.nonFieldErrors = nonFieldErrors || null;
        if (this.nonFieldErrors) {
            this.nonFieldErrors.bindToField('nonFieldErrors');
        }

        // store a list of keys (for iteration)
        this._errKeys = Object.keys(this._errors);
    }

    hasError() {
        return this._errKeys.length > 0;
    }

    asString(glue = '; ') {
        let prefix = '';

        if (this.nonFieldErrors) {
            prefix = `${this.nonFieldErrors}${this._errKeys.length ? glue : ''}`;
        }

        return prefix + this._errKeys.map(k => `${k}: ${this._errors[k].asString()}`)
                        .join(glue);
    }

    _iter() {
        return Object.keys(this._errors).map(x => this.errors[x]);
    }

    errorByIndex(index) {
        return this.errors[this._errKeys[index]];
    }
}

/**
 * Convert errorText (json or normal text) to a ValidationError
 *
 * @param {*} errorText
 * @param {Object} parentConfig
 */
export function parseErrors(errorText, parentConfig) {
    let error = null;

    if (isString(errorText)) {
        if (errorText) {
            try {
                error = JSON.parse(errorText);
            } catch (e) {
                // if json parsing fails, handle as text
                error = errorText;
            }
        } else {
            error = '';
        }
    } else {
        error = errorText;
    }

    // force undefined to be a string
    if (error === undefined) {
        error = `${undefined}`;
    }

    const result = parentConfig.prepareError(error, parentConfig);

    if (!result) {
        return result;
    }

    // istanbul ignore else: can only happen w/ custom prepareError
    if (result instanceof ValidationErrorInterface) {
        return result.hasError() ? result : null;
    }

    // For anything else, just return the result (why would anyone do this though?)
    // istanbul ignore next: can only happen w/ custom prepareError
    return result;
}

/**
 * Convert an error into a subclass of ValidationErrorInterface
 *
 * @param {*} err
 * @param {Object} parentConfig
 */
export function prepareError(err, parentConfig) {
    if (isString(err)) {
        // Note: SingleValidationError contains a list of errors per field
        return new SingleValidationError([err || '#$empty-message$#']);
    }

    else if (isArray(err)) {
        // If the array contains only strings, turn it into a SingleValidationError
        if (err.length > 0 && err.filter(x => isString(x)).length === err.length) {
            return new SingleValidationError(err);
        }

        // Parse children of the error and continue
        const errors = err.map(x => parentConfig.prepareError(x, parentConfig));

        // Should be a nested error, turn it into ListValidationError
        return new ListValidationError(errors);
    }

    else if (isObject(err)) {
        const errors = typeof err.errors === 'undefined' ? err : err.errors;

        let resNonField = null;
        const resErrors = {};

        Object.keys(errors).forEach((key) => {
            const error = parentConfig.prepareError(errors[key], parentConfig);

            if (key === 'non_field_errors') {
                resNonField = error;
            }

            // note: we only add errors as fields if we can parse the field error (or need to)
            else if (error !== null) {
                resErrors[key] = error;
            }
        });

        // if no errors ensure atleast a default message is set
        if (Object.keys(resErrors).length === 0 && !resNonField) {
            resNonField = new SingleValidationError([err || '#$empty-message$#']);
        }

        return new ValidationError(resErrors, resNonField);
    }

    // If undefined/null, lets turn it into a null
    else if (!hasValue(err)) {
        return null;
    }

    // Everything else gets turned into a string (bools, numbers, binary)
    else {
        // Note: Empty string means there is no error
        err = `${err}`;

        // istanbul ignore else: only custom classes w/ custom toString
        if (err) {
            return new SingleValidationError([err]);
        }

        // istanbul ignore next: only custom classes w/ custom toString
        return null;
    }
}
