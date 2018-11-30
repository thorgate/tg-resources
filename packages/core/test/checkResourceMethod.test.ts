import 'jest-extended';

import { isFetchMethod, isPostMethod } from '../src';


describe('checkResource methods', () => {
    // check Fetch methods
    test('isFetchMethod :: fetch', () => {
        expect(isFetchMethod('fetch')).toBeTrue();
    });

    test('isFetchMethod :: head', () => {
        expect(isFetchMethod('head')).toBeTrue();
    });

    test('isFetchMethod :: options', () => {
        expect(isFetchMethod('options')).toBeTrue();
    });

    test('isFetchMethod :: invalid', () => {
        expect(isFetchMethod('invalid')).toBeFalse();
    });

    // check Post methods
    test('isFetchMethod :: post', () => {
        expect(isPostMethod('post')).toBeTrue();
    });

    test('isFetchMethod :: patch', () => {
        expect(isPostMethod('patch')).toBeTrue();
    });

    test('isFetchMethod :: put', () => {
        expect(isPostMethod('put')).toBeTrue();
    });

    test('isFetchMethod :: del', () => {
        expect(isPostMethod('del')).toBeTrue();
    });

    test('isFetchMethod :: invalid', () => {
        expect(isPostMethod('invalid')).toBeFalse();
    });
});
