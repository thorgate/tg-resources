import { assert, expect } from 'chai';

import {ValidationError} from '../';

let instance = null;

const responseBody = {
    statusCode: 400,
    statusText: 'Bad Request',
    responseText: JSON.stringify({
        errors: {
            // Converted to single string
            non_field_errors: [
                'Something is generally broken'
            ],

            // Converted to a string joined by a comma
            password: [
                'too short',
                'missing numbers'
            ],

            // JSON stringify is used
            email: {
                'something': 'be wrong yo',
            },

            // Will be converted to a string
            remember: false,
        },
    }),
};


export default {
    'ValidationError api': {
        beforeEach() {
            instance = new ValidationError(responseBody);
        },

        'constructor works'() {
            // ResponseText can be empty
            new ValidationError({responseText: ""});

            // ResponseText can be mising
            new ValidationError({});

            // No args also works
            new ValidationError();
        },
        'instance.statusCode is correct'() {
            expect(instance.statusCode).to.equal(400);
        },
        'instance.statusText is correct'() {
            expect(instance.statusText).to.equal('Bad Request');
        },
        'instance.responseText is correct'() {
            expect(instance.responseText).to.equal(responseBody.responseText);
        },
        'toString works'() {
            expect(instance.toString()).to.equal(`ValidationError 400: Bad Request`);
            expect(instance.toString()).to.equal(instance._message);
        },
        'isNetworkError is false'() {
            expect(instance.isNetworkError).to.equal(false);
        },
        'isInvalidResponseCode is false'() {
            expect(instance.isInvalidResponseCode).to.equal(false);
        },
        'isValidationError is true'() {
            expect(instance.isValidationError).to.equal(true);
        },
        'errors are normalized correctly'() {
            expect(instance.nonFieldErrors).to.equal('Something is generally broken');
            expect(instance.errors).to.be.a('object');

            expect(instance.errors.password).to.be.equal('too short, missing numbers');
            expect(instance.errors.remember).to.be.equal('false');

            // TODO: Nest ValidationErrors in this case?
            expect(instance.errors.email).to.be.equal(JSON.stringify({
                'something': 'be wrong yo',
            }));
        },
        'getFieldError works'() {
            expect(instance.getFieldError).to.be.a('function');

            expect(instance.getFieldError('password')).to.be.equal('too short, missing numbers');
            expect(instance.getFieldError('remember')).to.be.equal('false');
            expect(instance.getFieldError('email')).to.be.equal(JSON.stringify({
                'something': 'be wrong yo',
            }));

            expect(instance.getFieldError('random-field')).to.be.a('null');
            expect(instance.getFieldError('random-field', true)).to.be.equal('Something is generally broken');
        },
        'firstError works'() {
            expect(instance.firstError).to.be.a('function');

            // First error without allowNonField should be the password error
            expect(instance.firstError()).to.be.equal('too short, missing numbers');

            // First error with allowNonField should be the nonFieldError
            expect(instance.firstError(true)).to.be.equal('Something is generally broken');

            // First error with allowNonField without non_field_errors should be a field error
            expect(new ValidationError({
                responseText: JSON.stringify({
                    errors: {
                        foo: ['bar', 'baz']
                    }
                })
            }).firstError(true)).to.be.equal('bar, baz');

            // If non_field_errors is an empty array, we want to be sure we don't handle it as an error
            expect(new ValidationError({
                responseText: JSON.stringify({
                    errors: {
                        non_field_errors: [],
                        foo: ['bar', 'baz']
                    }
                })
            }).firstError(true)).to.be.equal('bar, baz');

            // If no errors it should return null
            expect(new ValidationError({
                responseText: "{}"
            }).firstError()).to.be.a('null');
        }
    },
};
