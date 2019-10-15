import { InvalidResponseCode } from '../src';

let instance: InvalidResponseCode;

beforeEach(() => {
    instance = new InvalidResponseCode(500, 'Internal Server Error');
});

describe('InvalidResponseCode api', () => {
    test('instance.statusCode is correct', () => {
        expect(instance.statusCode).toEqual(500);
    });

    test('instance.responseText is correct', () => {
        expect(instance.responseText).toEqual('Internal Server Error');
    });

    test('toString works', () => {
        expect(instance.toString()).toEqual(
            'InvalidResponseCode 500: Internal Server Error'
        );
    });

    test('isAbortError is false', () => {
        expect(instance.isAbortError).toEqual(false);
    });

    test('isNetworkError is false', () => {
        expect(instance.isNetworkError).toEqual(false);
    });

    test('isValidationError is false', () => {
        expect(instance.isValidationError).toEqual(false);
    });

    test('isInvalidResponseCode is true', () => {
        expect(instance.isInvalidResponseCode).toEqual(true);
    });
});
