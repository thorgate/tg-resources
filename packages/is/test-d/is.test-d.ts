import { expectNever, expectType } from 'tsd';

import * as is from '../src';

let testValue: null | string | string[] | number | number[] | any[];

// hasValue

testValue = 'asd';
if (is.hasValue(testValue)) {
    expectType<string>(testValue);
}

testValue = 10;
if (is.hasValue(testValue)) {
    expectType<number>(testValue);
}

// isFunction / isObject
let fn: { id: number } | (() => void) = { id: 1 };
if (is.isFunction(fn)) {
    expectNever(fn);
}
if (is.isObject(fn)) {
    expectType<{ id: number }>(fn);
}

fn = () => {};
if (is.isFunction(fn)) {
    expectType<() => void>(fn);
}

// isString / isStringArray
testValue = 'null';
if (is.isString(testValue)) {
    expectType<string>(testValue);
}

testValue = 1;
if (is.isString(testValue)) {
    expectNever(testValue);
}

testValue = ['a', 'b'];
if (is.isStringArray(testValue)) {
    expectType<string[]>(testValue);
}

testValue = ['a', 1];
if (is.isStringArray(testValue)) {
    expectType<string[]>(testValue);
} else {
    expectType<any[]>(testValue);
}
