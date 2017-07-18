import { expect } from 'chai';

import { RequestValidationError, ValidationError, ValidationErrorInterface } from '../src';

let instance = null;

const responseText = JSON.stringify({
    errors: {
        non_field_errors: [
            'Something is generally broken',
        ],

        password: [
            'too short',
            'missing numbers',
        ],

        email: {
            something: 'be wrong yo',
        },

        remember: false,
    },
});

export default {
    'RequestValidationError api': {
        beforeEach() {
            instance = new RequestValidationError(400, responseText);
        },
        'constructor works': () => {
            // ResponseText can be empty
            new RequestValidationError(400, '');

            // ResponseText can be missing
            new RequestValidationError(0, {});

            // No args also works
            new RequestValidationError();
        },
        'instance.statusCode is correct': () => {
            expect(instance.statusCode).to.equal(400);
        },
        'instance.responseText is correct': () => {
            expect(instance.responseText).to.equal(responseText);
        },
        'toString works': () => {
            expect(instance.toString()).to.equal(`RequestValidationError 400: ${responseText}`);
            expect(instance.toString()).to.equal(instance._message);
        },
        'isNetworkError is false': () => {
            expect(instance.isNetworkError).to.equal(false);
        },
        'isInvalidResponseCode is false': () => {
            expect(instance.isInvalidResponseCode).to.equal(false);
        },
        'isValidationError is true': () => {
            expect(instance.isValidationError).to.equal(true);
        },
        'errors method returns a ValidationError': () => {
            expect(instance.errors).to.be.an.instanceof(ValidationError);
            expect(instance.errors).to.be.an.instanceof(ValidationErrorInterface);
        },
        'hasError is true': () => {
            expect(instance.hasError).to.be.a('function');
            expect(instance.hasError()).to.be.equal(true);
        },
        'ensures that empty errors are still errors': () => {
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

            toTest.forEach((element, i) => {
                expect(element.hasError()).to.be.equal(true, `index: ${i}`);
            });
        },
    },
};
