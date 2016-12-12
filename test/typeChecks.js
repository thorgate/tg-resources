import { expect } from 'chai';

import { isArray, hasValue, isFunction, isObject, isString, isSubClass } from '../src/typeChecks';


export default {
    'typeChecks api': {
        'isArray works': () => {
            expect(isArray(null)).to.equal(false);
            expect(isArray('hello')).to.equal(false);
            expect(isArray(undefined)).to.equal(false);
            expect(isArray(false)).to.equal(false);
            expect(isArray(true)).to.equal(false);
            expect(isArray(1)).to.equal(false);
            expect(isArray({})).to.equal(false);
            expect(isArray(NaN)).to.equal(false);

            expect(isArray([])).to.equal(true);
        },

        'hasValue works': () => {
            expect(hasValue(null)).to.equal(false);
            expect(hasValue(undefined)).to.equal(false);

            expect(hasValue('world')).to.equal(true);
            expect(hasValue(false)).to.equal(true);
            expect(hasValue(true)).to.equal(true);
            expect(hasValue(1)).to.equal(true);
            expect(hasValue({})).to.equal(true);
            expect(hasValue([])).to.equal(true);
            expect(hasValue(NaN)).to.equal(true);
        },

        'isFunction works': () => {
            expect(isFunction(null)).to.equal(false);
            expect(isFunction(undefined)).to.equal(false);
            expect(isFunction(false)).to.equal(false);
            expect(isFunction(true)).to.equal(false);
            expect(isFunction(1)).to.equal(false);
            expect(isFunction({})).to.equal(false);
            expect(isFunction([])).to.equal(false);
            expect(isFunction(NaN)).to.equal(false);
            expect(isFunction('my')).to.equal(false);

            expect(isFunction(function f() {})).to.equal(true); // eslint-disable-line prefer-arrow-callback
            expect(isFunction(() => 1)).to.equal(true);
            expect(isFunction(hasValue)).to.equal(true);

            // Test window.alert edge case by manually defining window.alert
            const old = global.window;
            global.window = {
                alert() {},
            };
            expect(isFunction(window.alert)).to.equal(true); // eslint-disable-line no-undef
            global.window = old;
        },

        'isObject works': () => {
            expect(isObject(null)).to.equal(false);
            expect(isObject(undefined)).to.equal(false);
            expect(isObject(false)).to.equal(false);
            expect(isObject(true)).to.equal(false);
            expect(isObject(1)).to.equal(false);
            expect(isObject([])).to.equal(false);
            expect(isObject(NaN)).to.equal(false);
            expect(isObject(function f() {})).to.equal(false); // eslint-disable-line prefer-arrow-callback
            expect(isObject(() => 1)).to.equal(false);
            expect(isObject(isFunction)).to.equal(false);
            expect(isObject('name')).to.equal(false);

            expect(isObject({})).to.equal(true);
            expect(isObject(Object())).to.equal(true);
        },

        'isString works': () => {
            expect(isString(null)).to.equal(false);
            expect(isString(undefined)).to.equal(false);
            expect(isString(false)).to.equal(false);
            expect(isString(true)).to.equal(false);
            expect(isString(1)).to.equal(false);
            expect(isString([])).to.equal(false);
            expect(isString(NaN)).to.equal(false);
            expect(isString(function f() {})).to.equal(false); // eslint-disable-line prefer-arrow-callback
            expect(isString(() => 1)).to.equal(false);
            expect(isString(isFunction)).to.equal(false);
            expect(isString({})).to.equal(false);
            expect(isString(Object())).to.equal(false);

            expect(isString('is')).to.equal(true);
        },

        'isSubClass works': () => {
            class Vehicle { }
            class Car extends Vehicle { }
            class Audi extends Car { }
            class Bird { }

            expect(isSubClass(Vehicle, Object)).to.equal(true);
            expect(isSubClass(Car, Object)).to.equal(true);
            expect(isSubClass(Audi, Object)).to.equal(true);
            expect(isSubClass(Bird, Object)).to.equal(true);

            expect(isSubClass(Car, Vehicle)).to.equal(true);
            expect(isSubClass(Audi, Car)).to.equal(true);

            expect(isSubClass(Vehicle, Vehicle)).to.equal(true);
            expect(isSubClass(Car, Car)).to.equal(true);
            expect(isSubClass(Audi, Audi)).to.equal(true);
            expect(isSubClass(Bird, Bird)).to.equal(true);
            expect(isSubClass(Audi, Vehicle)).to.equal(true);

            expect(isSubClass(Bird, Vehicle)).to.equal(false);
            expect(isSubClass(Bird, Car)).to.equal(false);
            expect(isSubClass(Bird, Audi)).to.equal(false);
            expect(isSubClass(Bird, Function)).to.equal(false);
            expect(isSubClass('Harambe', Bird)).to.equal(false);
        },
    },
};
