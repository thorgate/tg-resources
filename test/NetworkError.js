import { expect } from 'chai';

import { NetworkError } from '../index';


let instance = null;
const errObject = {
    text: 'im an error, for real!'
};


export default {
    'NetworkError api': {
        beforeEach() {
            instance = new NetworkError(errObject);
        },
        'instance.error is correct'() {
            expect(instance.error).to.equal(errObject);
        },
        'toString works'() {
            expect(instance.toString()).to.equal('NetworkError');
            expect(instance.toString()).to.equal(instance._message);
        },
        'isValidationError is false'() {
            expect(instance.isValidationError).to.equal(false);
        },
        'isInvalidResponseCode is false'() {
            expect(instance.isInvalidResponseCode).to.equal(false);
        },
        'isNetworkError is true'() {
            expect(instance.isNetworkError).to.equal(true);
        },
    },
};
