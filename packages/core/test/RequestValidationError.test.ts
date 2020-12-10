import {
    RequestValidationError,
    ValidationError,
    ValidationErrorInterface,
} from '../src';

let instance: RequestValidationError;

const responseText = JSON.stringify({
    errors: {
        non_field_errors: ['Something is generally broken'],

        password: ['too short', 'missing numbers'],

        email: {
            something: 'be wrong yo',
        },

        remember: false,
    },
});

beforeEach(() => {
    instance = new RequestValidationError(400, responseText);
});

describe('RequestValidationError api', () => {
    test('constructor works', () => {
        // ResponseText can be empty
        new RequestValidationError(400, '');

        // ResponseText can be missing
        new RequestValidationError(0, {});

        // No args also works
        new RequestValidationError();
    });

    test('instance.statusCode is correct', () => {
        expect(instance.statusCode).toEqual(400);
    });

    test('instance.responseText is correct', () => {
        expect(instance.responseText).toEqual(responseText);
    });

    test('toString works', () => {
        expect(instance.toString()).toEqual(
            `RequestValidationError 400: ${responseText}`
        );
    });

    test('isAbortError is false', () => {
        expect(instance.isAbortError).toEqual(false);
    });

    test('isNetworkError is false', () => {
        expect(instance.isNetworkError).toEqual(false);
    });

    test('isInvalidResponseCode is false', () => {
        expect(instance.isInvalidResponseCode).toEqual(false);
    });

    test('isValidationError is true', () => {
        expect(instance.isValidationError).toEqual(true);
    });

    test('errors method returns a ValidationError', () => {
        expect(instance.errors).toBeInstanceOf(ValidationError);
        expect(instance.errors).toBeInstanceOf(ValidationErrorInterface);
    });

    test('hasError is true', () => {
        expect(typeof instance.hasError).toBe('function');
        expect(instance.hasError()).toEqual(true);
    });

    test('ensures that empty errors are still errors', () => {
        const toTest = [
            // ResponseText can be empty
            new RequestValidationError(400, ''),

            // ResponseText can be undefined
            new RequestValidationError(400, undefined),

            // ResponseText can be false
            new RequestValidationError(400, false),

            // No args also works
            new RequestValidationError(400),
        ];

        toTest.forEach((element) => {
            expect(element.hasError()).toEqual(true);
        });
    });
});
