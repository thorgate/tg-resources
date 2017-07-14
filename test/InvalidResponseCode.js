import { expect } from 'chai';

import { InvalidResponseCode } from '../src';


let instance = null;

export default {
    'InvalidResponseCode api': {
        beforeEach() {
            instance = new InvalidResponseCode(500, 'Internal Server Error');
        },
        'instance.statusCode is correct': () => {
            expect(instance.statusCode).to.equal(500);
        },
        'instance.responseText is correct': () => {
            expect(instance.responseText).to.equal('Internal Server Error');
        },
        'toString works': () => {
            expect(instance.toString()).to.equal('InvalidResponseCode 500: Internal Server Error');
            expect(instance.toString()).to.equal(instance._message);
        },
        'isNetworkError is false': () => {
            expect(instance.isNetworkError).to.equal(false);
        },
        'isValidationError is false': () => {
            expect(instance.isValidationError).to.equal(false);
        },
        'isInvalidResponseCode is true': () => {
            expect(instance.isInvalidResponseCode).to.equal(true);
        },
    },
};
