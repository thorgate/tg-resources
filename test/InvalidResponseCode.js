import { assert, expect } from 'chai';

import {InvalidResponseCode} from '../lib';


let instance = null;
const errObject = {
    text: 'im an error, for real!'
};


export default {
    'InvalidResponseCode api': {
        beforeEach() {
            instance = new InvalidResponseCode(500, 'Internal Server Error', 'It broke yo!');
        },
        'instance.statusCode is correct'() {
            expect(instance.statusCode).to.equal(500);
        },
        'instance.statusText is correct'() {
            expect(instance.statusText).to.equal('Internal Server Error');
        },
        'instance.responseText is correct'() {
            expect(instance.responseText).to.equal('It broke yo!');
        },
        'toString works'() {
            expect(instance.toString()).to.equal('InvalidResponseCode 500: Internal Server Error');
            expect(instance.toString()).to.equal(instance._message);
        },
        'isNetworkError is false'() {
            expect(instance.isNetworkError).to.equal(false);
        },
        'isValidationError is false'() {
            expect(instance.isValidationError).to.equal(false);
        },
        'isInvalidResponseCode is true'() {
            expect(instance.isInvalidResponseCode).to.equal(true);
        },
    },
};
