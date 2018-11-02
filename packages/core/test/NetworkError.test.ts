import { NetworkError } from '../src';


let instance: NetworkError;
const errObject = {
    text: 'im an error, for real!',
};

beforeEach(() => {
    instance = new NetworkError(errObject);
});


describe('NetworkError api', () => {
    test('instance.error is correct', () => {
        expect(instance.error).toEqual(errObject);
    });

    test('toString works', () => {
        expect(instance.toString()).toEqual('NetworkError');
    });

    test('isValidationError is false', () => {
        expect(instance.isValidationError).toEqual(false);
    });

    test('isInvalidResponseCode is false', () => {
        expect(instance.isInvalidResponseCode).toEqual(false);
    });

    test('isNetworkError is true', () => {
        expect(instance.isNetworkError).toEqual(true);
    });
});
