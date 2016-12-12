import { assert, expect } from 'chai';

import * as tgResources from '../index';
import { isSubClass } from '../src/typeChecks';


export default {
    'Exports correct variables': {
        'exports contain expected keys'() {
            expect(tgResources.GenericResource).to.be.a('function', 'GenericResource is exported');
            expect(tgResources.BaseResourceError).to.be.a('function', 'BaseResourceError is exported');
            expect(tgResources.InvalidResponseCode).to.be.a('function', 'InvalidResponseCode is exported');
            expect(tgResources.ValidationError).to.be.a('function', 'ValidationError is exported');
            expect(tgResources.NetworkError).to.be.a('function', 'NetworkError is exported');

            expect(tgResources.getConfig).to.be.a('undefined', 'getConfig is not exported');
            expect(tgResources.setConfig).to.be.a('undefined', 'setConfig is not exported');
        },
    },
    'correct subclassing': {
        'SingleObjectResource is subclass of GenericResource'() {
            assert(isSubClass(tgResources.Resource, tgResources.GenericResource), 'its not');
        },
        'InvalidResponseCode is subclass of BaseResourceError'() {
            assert(isSubClass(tgResources.InvalidResponseCode, tgResources.BaseResourceError), 'its not');
        },
        'ValidationError is subclass of InvalidResponseCode'() {
            assert(isSubClass(tgResources.ValidationError, tgResources.BaseResourceError), 'its not');
        },
        'ValidationError is subclass of BaseResourceError'() {
            assert(isSubClass(tgResources.ValidationError, tgResources.BaseResourceError), 'its not');
        },
        'NetworkError is subclass of BaseResourceError'() {
            assert(isSubClass(tgResources.ValidationError, tgResources.BaseResourceError), 'its not');
        },
    },
};
