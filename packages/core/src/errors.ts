import { hasValue } from '@tg-resources/is';

import {
    ConfigType,
    RequestConfig,
    ResourceErrorInterface,
    ValidationErrorInterface,
} from './types';
import { truncate } from './util';
import { parseErrors, prepareError } from './ValidationError';

export type ResponseText = string | boolean | undefined | any;

export class AbortError extends ResourceErrorInterface {
    public readonly error: any;

    public readonly name: string;
    public readonly type: string;

    constructor(error: any) {
        super('AbortError: The user aborted a request.');

        this.error = error;

        this.name = 'AbortError';
        this.type = (error ? error.type : null) || 'aborted';
    }

    get isAbortError() {
        return true;
    }
}

export class NetworkError extends ResourceErrorInterface {
    public readonly error: any;

    constructor(error: any) {
        super('NetworkError');

        this.error = error;
    }

    get isNetworkError() {
        return true;
    }
}

export class InvalidResponseCode extends ResourceErrorInterface {
    public readonly statusCode: number | null;
    public readonly responseText: ResponseText;

    constructor(
        statusCode: number | null = null,
        responseText?: ResponseText,
        type = 'InvalidResponseCode'
    ) {
        super(`${type} ${statusCode}: ${truncate(responseText, 256)}`);

        this.statusCode = statusCode;
        this.responseText = responseText;
    }

    public get isInvalidResponseCode() {
        return true;
    }
}

export class RequestValidationError extends InvalidResponseCode {
    protected _customConfig: RequestConfig;
    protected readonly _errors: ValidationErrorInterface | null;

    constructor(
        statusCode: number | null = null,
        responseText?: ResponseText,
        config: RequestConfig = null
    ) {
        super(statusCode, responseText, 'RequestValidationError');

        // Set custom config
        this._customConfig = {
            parseErrors,
            prepareError,
            ...(config || {}),
        };

        // parse response body as a ValidationError
        // _customConfig has parseErrors so we just type cast to ensure this condition is fulfilled
        this._errors = (this._customConfig as ConfigType).parseErrors(
            responseText,
            this._customConfig as ConfigType
        );
    }

    // public api
    public get isValidationError() {
        return true;
    }

    public get isInvalidResponseCode() {
        return false;
    }

    public get errors() {
        return this._errors;
    }

    public hasError() {
        if (hasValue(this._errors)) {
            return this._errors.hasError();
        }

        // istanbul ignore next: Only happens on network errors
        return false;
    }
}
