import * as is from '../src';

let testValue: string | string[] | number | number[] | Array<any> | null;

// hasValue

testValue = 'asd';
if (is.hasValue(testValue)) {
    // $ExpectType string
    testValue;
}

testValue = null;
if (is.hasValue(testValue)) {
    // $ExpectType null
    testValue;
}

// isFunction / isObject
let fn: { id: number } | (() => void) = { id: 1 };
if (is.isFunction(fn)) {
    // $ExpectType never
    fn;
}
if (is.isObject(fn)) {
    // $ExpectType { id: number; }
    fn;
}

fn = () => {};
if (is.isFunction(fn)) {
    // $ExpectType () => void
    fn;
}

// isString / isStringArray
testValue = 'null';
if (is.isString(testValue)) {
    // $ExpectType string
    testValue;
}

testValue = null;
if (is.isString(testValue)) {
    // $ExpectType never
    testValue;
}

testValue = ['a', 'b'];
if (is.isStringArray(testValue)) {
    // $ExpectType string[]
    testValue;
}

testValue = ['a', 1];
if (is.isStringArray(testValue)) {
    // $ExpectType string[]
    testValue;
} else {
    // $ExpectType any[]
    testValue;
}
