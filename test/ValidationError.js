import { expect } from 'chai';
import { spy } from 'sinon';

import {
    ValidationError,
    ListValidationError,
    SingleValidationError,
    parseErrors,
    prepareError,
} from '../src';


/**
 * @param {*} error
 * @param {Number | String?} strVal If defined compared against error.toString result
 * @param {T?} type If null error must be null, else error must be instance of type
 */
const expectValidationError = (error, { strVal, type }) => {
    if (type !== undefined) {
        if (type === null) {
            expect(error).to.be.equal(null);
        } else {
            expect(error).to.be.a.instanceof(type);
        }
    }

    if (strVal !== undefined) {
        expect(error.toString).to.be.a('function');
        expect(error.toString()).to.be.equal(strVal);
    }
};

const expectParentValidationError = (parent, fieldName, { toString, type, allowNonField }) => {
    expect(parent.getError).to.be.a('function');

    expectValidationError(parent.getError(fieldName, allowNonField || false), { toString, type });
};


let instance;

export default {
    'String conversion': {
        'SingleValidationError - simple': () => {
            const a = new SingleValidationError(['bar']);

            expect(a.asString()).to.equal('bar');
            expect(a.toString()).to.equal(a.asString());
            expect(`${a}`).to.equal(a.asString());
        },
        'SingleValidationError - asString glue': () => {
            const b = new SingleValidationError(['i', 'have', 'issues...']);

            expect(b.asString()).to.equal('i have issues...');
            expect(b.toString()).to.equal(b.asString());
            expect(`${b}`).to.equal(b.asString());

            expect(b.asString('+')).to.equal('i+have+issues...');
        },

        'ListValidationError - simple': () => {
            const f = new ListValidationError([
                new SingleValidationError(['bar']),
                new SingleValidationError(['swag', 'ded']),
            ], new SingleValidationError(['am nonField error']));

            expect(f.asString()).to.equal('0: bar; 1: swag ded');
            expect(f.toString()).to.equal(f.asString());
            expect(`${f}`).to.equal(f.asString());
        },

        'ListValidationError - asString glue': () => {
            const f = new ListValidationError([
                new SingleValidationError(['bar']),
                new SingleValidationError(['swag', 'ded']),
            ], new SingleValidationError(['am nonField error']));

            expect(f.asString('+')).to.equal('0: bar+1: swag ded');
        },

        'ValidationError - simple': () => {
            const f = new ValidationError({
                foo: new SingleValidationError(['bar']),
                yolo: new SingleValidationError(['swag', 'ded']),
            }, new SingleValidationError(['am nonField error']));

            expect(f.asString()).to.equal('am nonField error; foo: bar; yolo: swag ded');
            expect(f.toString()).to.equal(f.asString());
            expect(`${f}`).to.equal(f.asString());
        },

        'ValidationError - w/o nonFields': () => {
            const f = new ValidationError({
                foo: new SingleValidationError(['bar']),
                yolo: new SingleValidationError(['swag', 'ded']),
            }, null);

            expect(f.asString()).to.equal('foo: bar; yolo: swag ded');
            expect(f.toString()).to.equal(f.asString());
            expect(`${f}`).to.equal(f.asString());
        },

        'ValidationError - asString glue': () => {
            const f = new ValidationError({
                foo: new SingleValidationError(['bar']),
                yolo: new SingleValidationError(['swag', 'ded']),
            }, new SingleValidationError(['am nonField error']));

            expect(f.asString('+')).to.equal('am nonField error+foo: bar+yolo: swag ded');
        },
    },

    'ValidationError helper methods': {
        beforeEach() {
            instance = new ValidationError({
                password: new SingleValidationError([
                    'too short.',
                    'missing numbers.',
                ]),
                email: new ValidationError({
                    something: new SingleValidationError([
                        'be wrong yo',
                    ]),
                }),
                remember: new SingleValidationError([
                    'false',
                ]),
                deliveryAddress: new ListValidationError([
                    new ValidationError(null, new SingleValidationError([
                        'Provided address is not supported',
                    ])),
                    null,
                    new ValidationError({
                        zip: new SingleValidationError([
                            'Please enter a valid address',
                        ]),
                        country: new SingleValidationError([
                            'This field is required.',
                            'Please select a valid country.',
                        ]),
                    }),
                    null,
                    null,
                    null,
                ]),
            }, new SingleValidationError(['Something is generally broken']));
        },

        'getError works': () => {
            expectParentValidationError(instance, 'password', {
                strVal: 'too short. missing numbers.',
                type: SingleValidationError,
            });

            expectParentValidationError(instance, 'remember', {
                strVal: 'false',
                type: SingleValidationError,
            });
        },

        'nested getError works': () => {
            expectParentValidationError(instance, 'email', {
                type: ValidationError,
            });

            expectParentValidationError(instance.getError('email'), 'something', {
                strVal: 'be wrong yo',
                type: SingleValidationError,
            });
        },

        'ListValidationError getError works': () => {
            expectParentValidationError(instance, 'deliveryAddress', {
                type: ListValidationError,
            });

            expectParentValidationError(instance.getError('deliveryAddress'), 0, {
                strVal: 'Provided address is not supported',
                type: ValidationError,
            });
            expectParentValidationError(instance.getError('deliveryAddress'), 1, {
                type: null,
            });
            expectParentValidationError(instance.getError('deliveryAddress'), 2, {
                strVal: 'zip: Please enter a valid address; country: This field is required. Please select a valid country.',
                type: ValidationError,
            });
            expectParentValidationError(instance.getError('deliveryAddress'), 3, {
                type: null,
            });
            expectParentValidationError(instance.getError('deliveryAddress'), 4, {
                type: null,
            });
            expectParentValidationError(instance.getError('deliveryAddress'), 5, {
                type: null,
            });
            expectParentValidationError(instance.getError('deliveryAddress'), 99, {
                type: null,
            });
        },
        'getError - allowNonField flag': () => {
            // getError for a non-existing field w/o allowNonField, should give us null
            expectParentValidationError(instance, 'random-field', {
                type: null,
                allowNonField: false,
            });

            // getError for a non-existing field with allowNonField, should give us nonFieldErrors
            expectParentValidationError(instance, 'random-field', {
                strVal: 'Something is generally broken',
                type: SingleValidationError,
                allowNonField: true,
            });

            // getError for an existing field with allowNonField, should give us the field
            expectParentValidationError(instance, 'password', {
                strVal: 'too short. missing numbers.',
                type: SingleValidationError,
                allowNonField: true,
            });

            // If no errors it should return null
            const noErr = new ValidationError();
            expect(noErr.nonFieldErrors).to.be.a('null');
            expect(noErr.getError('foo')).to.be.a('null');
            expect(noErr.getError('foo', true)).to.be.a('null');
        },
        'ValidationError firstError works': () => {
            expect(instance.firstError).to.be.a('function');

            // firstError w/o allowNonField, should give us `password`
            expectValidationError(instance.firstError(), {
                strVal: 'too short. missing numbers.',
                type: SingleValidationError,
                fieldName: 'password',
            });

            // firstError with allowNonField, should give us `nonFieldErrors`
            expectValidationError(instance.firstError(true), {
                strVal: 'Something is generally broken',
                type: SingleValidationError,
                fieldName: 'nonFieldErrors',
            });

            // If no errors it should return null (w/ and w/o allowNonField)
            const noErr = new ValidationError();
            expect(noErr.firstError()).to.be.a('null');
            expect(noErr.firstError(true)).to.be.a('null');
        },
        'ListValidationError firstError works': () => {
            expectParentValidationError(instance, 'deliveryAddress', {
                type: ListValidationError,
            });

            const dError = instance.getError('deliveryAddress');
            expect(dError.firstError).to.be.a('function');

            // Result must be the same for both
            [true, false].forEach((allowNonField) => {
                expectValidationError(dError.firstError(allowNonField), {
                    strVal: 'Provided address is not supported',
                    type: ValidationError,
                    fieldName: 0,
                });
            });

            // If no errors it should return null (w/ and w/o allowNonField)
            const noErr = new ListValidationError([]);
            expect(noErr.firstError()).to.be.a('null');
            expect(noErr.firstError(true)).to.be.a('null');
        },
    },

    'iteration api': {
        'ListValidationError - spread': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);

            const f = new ListValidationError([
                err1,
                err2,
            ]);

            expect([...f]).to.deep.equal([
                err1,
                err2,
            ]);
        },

        'ListValidationError - for .. of': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);
            const err3 = new SingleValidationError(['last']);

            const f = new ListValidationError([
                err1,
                err2,
                err3,
            ]);

            const expected = [
                'bar',
                'swag ded',
                'last',
            ];

            /* eslint-disable no-restricted-syntax */
            for (const error of f) {
                expect(error.fieldName).to.not.equal(undefined);
                expect(expected[error.fieldName]).to.not.equal(undefined);

                // access via f.errors
                expect(`${f.errors[error.fieldName]}`).to.equal(expected[error.fieldName]);

                // access via f.getError()
                expect(`${f.getError(error.fieldName)}`).to.equal(expected[error.fieldName]);
            }

            // Checks that we can break the for .. of loop
            for (const x of f) {
                expect(x).to.equal(err1);
                break;
            }
            /* eslint-enable no-restricted-syntax */
        },

        'ValidationError - spread': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);

            const f = new ValidationError({
                err1,
                err2,
            }, new SingleValidationError(['am nonField error']));

            expect([...f]).to.deep.equal([
                err1,
                err2,
            ]);
        },

        'ValidationError - for .. of': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);

            const f = new ValidationError({
                foo: err1,
                yolo: err2,
            }, new SingleValidationError(['am nonField error']));

            const expected = {
                foo: 'bar',
                yolo: 'swag ded',
            };

            /* eslint-disable no-restricted-syntax */
            for (const error of f) {
                expect(error.fieldName).to.not.equal(undefined);
                expect(expected[error.fieldName]).to.not.equal(undefined);

                // tostring is correct
                expect(`${error}`).to.equal(expected[error.fieldName]);

                // access via f.errors
                expect(`${f.errors[error.fieldName]}`).to.equal(expected[error.fieldName]);

                // access via f.getError()
                expect(`${f.getError(error.fieldName)}`).to.equal(expected[error.fieldName]);
            }

            // Checks that we can break the for .. of loop
            for (const x of f) {
                expect(x).to.equal(err1);
                break;
            }
            /* eslint-enable no-restricted-syntax */
        },

        'SingleValidationError - map': () => {
            const f = new SingleValidationError(['bar', 'baz']);

            const spyFn = spy();
            f.map(spyFn);

            expect(spyFn.calledWith('bar', 0)).to.be.equal(true);
            expect(spyFn.calledWith('baz', 1)).to.be.equal(true);
        },

        'ListValidationError - map': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);

            const f = new ListValidationError([err1, err2]);

            const spyFn = spy();
            f.map(spyFn);

            expect(spyFn.calledWith(err1, 0)).to.be.equal(true);
            expect(spyFn.calledWith(err2, 1)).to.be.equal(true);
        },

        'ValidationError - map': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);
            const nonFieldErr = new SingleValidationError(['am nonField error']);

            const f = new ValidationError({ err1, err2 }, nonFieldErr);

            const spyFn = spy();
            f.map(spyFn);

            expect(spyFn.calledWith(err1, 0)).to.be.equal(true);
            expect(spyFn.calledWith(err2, 1)).to.be.equal(true);
        },

        'SingleValidationError - forEach': () => {
            const f = new SingleValidationError(['bar', 'baz']);

            const spyFn = spy();
            f.forEach(spyFn);

            expect(spyFn.calledWith('bar', 0)).to.be.equal(true);
            expect(spyFn.calledWith('baz', 1)).to.be.equal(true);
        },

        'ListValidationError - forEach': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);

            const f = new ListValidationError([err1, err2]);

            const spyFn = spy();
            f.forEach(spyFn);

            expect(spyFn.calledWith(err1, 0)).to.be.equal(true);
            expect(spyFn.calledWith(err2, 1)).to.be.equal(true);
        },

        'ValidationError - forEach': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);
            const nonFieldErr = new SingleValidationError(['am nonField error']);

            const f = new ValidationError({ err1, err2 }, nonFieldErr);

            const spyFn = spy();
            f.forEach(spyFn);

            expect(spyFn.calledWith(err1, 0)).to.be.equal(true);
            expect(spyFn.calledWith(err2, 1)).to.be.equal(true);
        },

        'SingleValidationError - filter': () => {
            const f = new SingleValidationError(['bar', 'baz']);

            const spyFn = spy(() => false);
            const res = f.filter(spyFn);

            expect(spyFn.calledWith('bar', 0)).to.be.equal(true);
            expect(spyFn.calledWith('baz', 1)).to.be.equal(true);
            expect(res).to.be.deep.equal([]);
        },

        'ListValidationError - filter': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);

            const f = new ListValidationError([err1, err2]);

            const spyFn = spy(() => false);
            const res = f.filter(spyFn);

            expect(spyFn.calledWith(err1, 0)).to.be.equal(true);
            expect(spyFn.calledWith(err2, 1)).to.be.equal(true);
            expect(res).to.be.deep.equal([]);
        },

        'ValidationError - filter': () => {
            const err1 = new SingleValidationError(['bar']);
            const err2 = new SingleValidationError(['swag', 'ded']);
            const nonFieldErr = new SingleValidationError(['am nonField error']);

            const f = new ValidationError({ err1, err2 }, nonFieldErr);

            const spyFn = spy(() => false);
            const res = f.filter(spyFn);

            expect(spyFn.calledWith(err1, 0)).to.be.equal(true);
            expect(spyFn.calledWith(err2, 1)).to.be.equal(true);
            expect(res).to.be.deep.equal([]);
        },
    },

    // FIXME: separate this test to units
    'parseErrors api -': {
        beforeEach() {
            const text = JSON.stringify({
                errors: {
                    non_field_errors: [
                        'Something is generally broken',
                    ],

                    password: [
                        'too short',
                        'missing numbers.',
                    ],

                    remember: false,

                    email: {
                        something: 'be wrong yo',
                        stripped: null,
                    },

                    deliveryAddress: [
                        {
                            non_field_errors: [
                                'Provided address is not supported',
                            ],
                        },
                        null, // kept as null
                        '', // Replaced w/ special #$empty-message$#
                        {
                            zip: [
                                'Please enter a valid address',
                            ],
                            country: [
                                'This field is required.',
                                'Please select a valid country.',
                            ],
                        },
                    ],

                    coercesToNonField: {},
                },
            });

            instance = parseErrors(text, {
                parseErrors,
                prepareError,
            });
        },
        'parser conforms to contracts': () => {
            // based on the input the result should be of ValidationError type
            expect(instance).to.be.an.instanceof(ValidationError);

            expectParentValidationError(instance, undefined, {
                strVal: 'Something is generally broken',
                type: SingleValidationError,
                allowNonField: true,
            });

            expectParentValidationError(instance, 'password', {
                strVal: 'too short. missing numbers.',
                type: SingleValidationError,
            });

            expectParentValidationError(instance, 'remember', {
                strVal: 'false',
                type: SingleValidationError,
            });

            expectParentValidationError(instance, 'email', {
                type: ValidationError,
            });
            expectParentValidationError(instance.getError('email'), 'something', {
                strVal: 'be wrong yo',
                type: SingleValidationError,
            });
            expectParentValidationError(instance.getError('email'), 'stripped', {
                type: null,
            });

            expectParentValidationError(instance, 'deliveryAddress', {
                type: ListValidationError,
            });

            expectParentValidationError(instance.getError('deliveryAddress'), 0, {
                strVal: 'Provided address is not supported',
                type: ValidationError,
            });

            expectParentValidationError(instance.getError('deliveryAddress'), 1, {
                type: null,
            });

            expectParentValidationError(instance.getError('deliveryAddress'), 2, {
                type: SingleValidationError,
                strVal: '#$empty-message$#',
            });

            expectParentValidationError(instance.getError('deliveryAddress'), 3, {
                strVal: 'zip: Please enter a valid address; country: This field is required. Please select a valid country.',
                type: ValidationError,
            });

            expectParentValidationError(instance, 'coercesToNonField', {
                strVal: '#$empty-message$#',
                type: ValidationError,
            });
        },
    },
};
