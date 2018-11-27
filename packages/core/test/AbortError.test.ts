import { AbortError } from '../src';


let instance: AbortError;
const errObject = {
    text: 'im an error, for real!',
};

beforeEach(() => {
    instance = new AbortError(errObject);
});


describe('AbortError api', () => {
    test('instance.error is correct', () => {
        expect(instance.error).toEqual(errObject);
    });

    test('instance.name is correct', () => {
        expect(instance.name).toEqual('AbortError');
    });

    test('instance.type is correct', () => {
        expect(instance.type).toEqual('aborted');
        expect(new AbortError(null).type).toEqual('aborted');
    });

    test('instance.type is inherited from error', () => {
        expect(new AbortError({
            type: 'foo',
        }).type).toEqual('foo');
    });

    test('toString works', () => {
        expect(instance.toString()).toEqual('AbortError: The user aborted a request.');
    });

    test('isValidationError is false', () => {
        expect(instance.isValidationError).toEqual(false);
    });

    test('isInvalidResponseCode is false', () => {
        expect(instance.isInvalidResponseCode).toEqual(false);
    });

    test('isNetworkError is false', () => {
        expect(instance.isNetworkError).toEqual(false);
    });

    test('isAbortError is true', () => {
        expect(instance.isAbortError).toEqual(true);
    });
});
