import { assert, expect } from 'chai';

import * as tgResources from '../';

function isSubClass(B, A) {
    return B.prototype instanceof A || B === A;
}


export default {
    'Exports correct variables': {
        'exports contain expected keys'() {
            assert.isFunction(tgResources.default, 'default is exported');
            assert.isFunction(tgResources.getConfig, 'getConfig is exported');
            assert.isFunction(tgResources.setConfig, 'setConfig is exported');
            assert.isFunction(tgResources.GenericResource, 'GenericResource is exported');
            assert.isFunction(tgResources.BaseResourceError, 'BaseResourceError is exported');
            assert.isFunction(tgResources.InvalidResponseCode, 'InvalidResponseCode is exported');
            assert.isFunction(tgResources.ValidationError, 'ValidationError is exported');
            assert.isFunction(tgResources.NetworkError, 'NetworkError is exported');
        },
    },
    'correct subclassing': {
        'SingleObjectResource is subclass of GenericResource'() {
            assert(isSubClass(tgResources.default, tgResources.GenericResource), 'its not');
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
