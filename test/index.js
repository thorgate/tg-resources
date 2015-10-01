import { assert } from 'chai';

import * as tgResources from '../';

function isSubClass(B, A) {
    return B.prototype instanceof A || B === A;
}


// TODO: We should also test the actual logic
export default {
  'Exports correct variables': {
        'exports contain expected keys'() {
            assert.isFunction(tgResources.default);
            assert.isFunction(tgResources.getConfig);
            assert.isFunction(tgResources.setConfig);
            assert.isFunction(tgResources.GenericResource);
            assert.isFunction(tgResources.InvalidResponseCode);
            assert.isFunction(tgResources.ValidationError);
        },
        'SingleObjectResource is subclass of GenericResource'() {
            assert(isSubClass(tgResources.default, tgResources.GenericResource), 'its not');
        }
    }
};
