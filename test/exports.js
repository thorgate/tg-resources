import { assert, expect } from 'chai';

import * as tgResources from '../src';
import { isSubClass } from '../src/typeChecks';


export default {
    'Exports correct variables': {
        'exports contain expected keys': () => {
            expect(tgResources.GenericResource).to.be.a('function', 'GenericResource is exported');
            expect(tgResources.BaseResourceError).to.be.a('function', 'BaseResourceError is exported');
            expect(tgResources.InvalidResponseCode).to.be.a('function', 'InvalidResponseCode is exported');
            expect(tgResources.RequestValidationError).to.be.a('function', 'RequestValidationError is exported');
            expect(tgResources.NetworkError).to.be.a('function', 'NetworkError is exported');

            expect(tgResources.ValidationError).to.be.a('function', 'ValidationError is exported');
            expect(tgResources.ListValidationError).to.be.a('function', 'ListValidationError is exported');
            expect(tgResources.SingleValidationError).to.be.a('function', 'SingleValidationError is exported');
            expect(tgResources.ValidationErrorInterface).to.be.a('function', 'ValidationErrorInterface is exported');
            expect(tgResources.ParentValidationErrorInterface).to.be.a('function', 'ParentValidationErrorInterface is exported');

            expect(tgResources.Response).to.be.a('function', 'Response is exported');
        },
    },
    'correct subclassing': {
        'SingleObjectResource is subclass of GenericResource': () => {
            assert(isSubClass(tgResources.Resource, tgResources.GenericResource), 'its not');
        },
        'InvalidResponseCode is subclass of BaseResourceError': () => {
            assert(isSubClass(tgResources.InvalidResponseCode, tgResources.BaseResourceError), 'its not');
        },
        'RequestValidationError is subclass of InvalidResponseCode': () => {
            assert(isSubClass(tgResources.RequestValidationError, tgResources.InvalidResponseCode), 'its not');
        },
        'RequestValidationError is subclass of BaseResourceError': () => {
            assert(isSubClass(tgResources.RequestValidationError, tgResources.BaseResourceError), 'its not');
        },
        'NetworkError is subclass of BaseResourceError': () => {
            assert(isSubClass(tgResources.NetworkError, tgResources.BaseResourceError), 'its not');
        },
        'ValidationError is a separate class': () => {
            assert(!isSubClass(tgResources.ValidationError, tgResources.BaseResourceError), 'its not');
            assert(!isSubClass(tgResources.ValidationError, tgResources.InvalidResponseCode), 'its not');
            assert(!isSubClass(tgResources.ValidationError, tgResources.RequestValidationError), 'its not');
            assert(!isSubClass(tgResources.ValidationError, tgResources.NetworkError), 'its not');
        },
        'ValidationError is subclass of ValidationErrorInterface': () => {
            assert(isSubClass(tgResources.ValidationError, tgResources.ValidationErrorInterface), 'its not');
        },
        'ValidationError is subclass of ParentValidationErrorInterface': () => {
            assert(isSubClass(tgResources.ValidationError, tgResources.ParentValidationErrorInterface), 'its not');
        },
        'SingleValidationError is subclass of ValidationErrorInterface': () => {
            assert(isSubClass(tgResources.SingleValidationError, tgResources.ValidationErrorInterface), 'its not');
        },
        'ListValidationError is subclass of ValidationErrorInterface': () => {
            assert(isSubClass(tgResources.ListValidationError, tgResources.ValidationErrorInterface), 'its not');
        },
        'ListValidationError is subclass of ParentValidationErrorInterface': () => {
            assert(isSubClass(tgResources.ListValidationError, tgResources.ParentValidationErrorInterface), 'its not');
        },
    },
};
