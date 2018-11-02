import { hasValue, isArray, isObject, isString, isStringArray } from '@tg-resources/is';

import { ConfigType, ObjectMap, ValidationErrorInterface } from './types';


export type ValidationErrorType = SingleValidationError | ListValidationError | ValidationError | null;

export interface ValidationErrorObject {
    [key: string]: ValidationErrorType;
}

export type ListValidationErrorTypes = ValidationErrorType[];


const bindAndCoerce = (error: any, fieldName: string | number) => {
    const res = error || null;

    if (res !== null) {
        res.bindToField(fieldName);
    }

    return res;
};


export class SingleValidationError extends ValidationErrorInterface {
    constructor(errors: string[]) {
        // istanbul ignore next: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            if (!isArray(errors) || errors.filter((x) => !isString(x)).length > 0) {
                console.error('SingleValidationError: `errors` argument must be an array of strings');
            }
        }

        super(errors);
    }

    public hasError() {
        return this._errors.length > 0;
    }

    public asString(glue: string = ' ') {
        return this._errors.join(glue);
    }
}


export abstract class ParentValidationErrorInterface extends ValidationErrorInterface {
    // If null, there are no nonFieldErrors
    //
    // Some parent validation errors cannot have nonFieldErrors (e.g. ListValidationError,
    //  since a list cannot have attributes in JSON). Helps keep things DRY, since the result
    //  of getError & firstError won't change if nonFieldErrors is always null.
    public nonFieldErrors: ValidationErrorType = null;

    public getError(fieldName?: number | string | Array<string | number>, allowNonFields: boolean = false): ValidationErrorType {
        if (isArray(fieldName)) {
            let error: ValidationErrorInterface | null = null;

            // Might want to add check to avoid empty errors
            fieldName.forEach((field: number | string, idx) => {
                if (!error && idx === 0) {
                    error = this.errors[field];
                } else if (error) {
                    error = error.errors[field] || null;
                }
            });

            return error;
        }

        if ((hasValue(fieldName) && this.errors[fieldName]) || (allowNonFields && this.nonFieldErrors)) {
            return (hasValue(fieldName) ? this.errors[fieldName] : null) || this.nonFieldErrors || null;
        }

        return null;
    }

    public firstError(allowNonField: boolean = false) {
        if (allowNonField && this.nonFieldErrors) {
            return this.nonFieldErrors;
        }

        return this.errorByIndex(0) || null;
    }
}


export class ListValidationError extends ParentValidationErrorInterface {
    constructor(errors: ListValidationErrorTypes, nonFieldErrors: ValidationErrorType = null) {
        // istanbul ignore else: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            // Takes: anything thats not a ValidationError (besides null)
            const filterFn = (x: any) => {
                if (x === null) {
                    return false;
                }

                return !x || !(x instanceof ValidationErrorInterface);
            };

            if (errors) {
                // istanbul ignore next: safeguard
                if (!isArray(errors) || errors.filter(filterFn).length > 0) {
                    console.error('ListValidationError: `errors argument` must be an array of ValidationErrorInterface? instances');
                    console.error('    Supported Builtins: null/SingleValidationError/ListValidationError/ValidationError');
                }
            }
        }

        // MAP: falsy to null, bind all errors w/ their fieldName
        super((errors || []).map(bindAndCoerce));

        this.nonFieldErrors = nonFieldErrors || null;
        if (this.nonFieldErrors !== null) {
            this.nonFieldErrors.bindToField('nonFieldErrors');
        }
    }

    public hasError() {
        return this._errors.filter((x: any) => (
            x && x.hasError && x.hasError()
        )).length > 0;
    }

    public asString(glue: string = '; ') {
        return this._errors.map((value: ValidationErrorType, key: number) => (
            `${key}: ${value ? value.asString() : null}`
        )).join(glue);
    }
}


export class ValidationError extends ParentValidationErrorInterface {
    public nonFieldErrors: ValidationErrorType;

    constructor(errors: ValidationErrorObject | null = null, nonFieldErrors: ValidationErrorType = null) {
        // istanbul ignore else: never false in tests
        if (process.env.NODE_ENV !== 'production') {
            // Takes: anything thats not a ValidationError (besides null)
            const filterFn = (key: string) => {
                if (!errors || errors[key] === null) {
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
        const mutErrors: ValidationErrorObject = {};
        if (errors) {
            Object.keys(errors).forEach((fieldName) => {
                mutErrors[fieldName] = bindAndCoerce(errors[fieldName], fieldName);
            });
        }

        super(mutErrors);

        // Bind nonFieldErrors
        this.nonFieldErrors = nonFieldErrors || null;
        if (this.nonFieldErrors !== null) {
            this.nonFieldErrors.bindToField('nonFieldErrors');
        }

        // store a list of keys (for iteration)
        this._errKeys = Object.keys(this._errors);
    }

    private readonly _errKeys: string[];

    public hasError() {
        return this.nonFieldErrors !== null || this._errKeys.length > 0;
    }

    public asString(glue: string = '; ') {
        let prefix = '';

        if (this.nonFieldErrors) {
            prefix = `${this.nonFieldErrors}${this._errKeys.length ? glue : ''}`;
        }

        return prefix + this._errKeys
            .map((k) => `${k}: ${this._errors[k].asString()}`)
            .join(glue);
    }

    public _iter() {
        return Object.keys(this._errors).map((x) => this.errors[x]);
    }

    public errorByIndex(index: number) {
        return this.errors[this._errKeys[index]];
    }
}

/**
 * Convert errorText (json or normal text) to a ValidationError
 *
 * @param {*} errorText
 * @param {Object} parentConfig
 */
export function parseErrors(errorText: any, parentConfig: ConfigType): ValidationErrorInterface | null {
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

export interface GenericError {
    errors?: any;
    [key: string]: any;
}


/**
 * Convert an error into a subclass of ValidationErrorInterface
 *
 * @param {*} err
 * @param {Object} parentConfig
 */
export function prepareError(err: any, parentConfig: ConfigType) {
    if (isString(err)) {
        // Note: SingleValidationError contains a list of errors per field
        return new SingleValidationError([err || '#$empty-message$#']);
    }

    if (isArray(err)) {
        // If the array contains only strings, turn it into a SingleValidationError
        if (isStringArray(err)) {
            return new SingleValidationError(err);
        }

        // Parse children of the error and continue
        const errors = err.map((x) => (
            parentConfig.prepareError(x, parentConfig)
        ));

        // Should be a nested error, turn it into ListValidationError
        return new ListValidationError(errors);
    }

    if (isObject(err)) {
        let errors: GenericError = err;

        if ('errors' in errors && hasValue(errors.errors)) {
            errors = errors.errors;
        }

        let resNonField = null;
        const resErrors: ObjectMap = {};

        Object.keys(errors).forEach((key) => {
            const error = parentConfig.prepareError(errors[key], parentConfig);

            if (key === 'non_field_errors') {
                resNonField = error;
            } else if (error !== null) {
                // note: we only add errors as fields if we can parse the field error (or need to)
                resErrors[key] = error;
            }
        });

        // if no errors ensure atleast a default message is set
        if (Object.keys(resErrors).length === 0 && !resNonField) {
            // istanbul ignore else: Should only happen with custom error parsers
            if (Object.keys(err).length === 0) {
                // We are probably inside a ListValidationError where
                // this item is not an error, represented as `{}` by DRF
                return new ValidationError({});
            }

            // istanbul ignore next: Should only happen with custom error parsers
            resNonField = new SingleValidationError([hasValue(err) ? JSON.stringify(err) : '#$empty-message$#']);
        }

        return new ValidationError(resErrors, resNonField);
    }

    // If undefined/null, lets turn it into a null
    if (!hasValue(err)) {
        return null;
    }

    // Everything else gets turned into a string (bools, numbers, binary)
    // Note: Empty string means there is no error
    err = `${err}`;

    // istanbul ignore else: only custom classes w/ custom toString
    if (err) {
        return new SingleValidationError([err]);
    }

    // istanbul ignore next: only custom classes w/ custom toString
    return null;
}
