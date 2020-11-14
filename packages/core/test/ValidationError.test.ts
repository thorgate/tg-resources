import 'jest-extended';

import {
    ListValidationError,
    ParentValidationErrorInterface,
    SingleValidationError,
    ValidationError,
} from '../src';

import {
    expectParentValidationError,
    expectValidationError,
} from './testUtils';

let instance: ParentValidationErrorInterface;

beforeEach(() => {
    instance = new ValidationError(
        {
            password: new SingleValidationError([
                'too short.',
                'missing numbers.',
            ]),
            email: new ValidationError({
                something: new SingleValidationError(['be wrong yo']),
            }),
            remember: new SingleValidationError(['false']),
            deliveryAddress: new ListValidationError([
                new ValidationError(
                    null,
                    new SingleValidationError([
                        'Provided address is not supported',
                    ])
                ),
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
        },
        new SingleValidationError(['Something is generally broken'])
    );
});

describe('String conversion', () => {
    test('SingleValidationError - simple', () => {
        const a = new SingleValidationError(['bar']);

        expect(a.asString()).toEqual('bar');
        expect(a.toString()).toEqual(a.asString());
        expect(`${a}`).toEqual(a.asString());
    });

    test('SingleValidationError - asString glue', () => {
        const b = new SingleValidationError(['i', 'have', 'issues...']);

        expect(b.asString()).toEqual('i have issues...');
        expect(b.toString()).toEqual(b.asString());
        expect(`${b}`).toEqual(b.asString());

        expect(b.asString('+')).toEqual('i+have+issues...');
    });

    test('ListValidationError - simple', () => {
        const f = new ListValidationError(
            [
                new SingleValidationError(['bar']),
                new SingleValidationError(['swag', 'ded']),
            ],
            new SingleValidationError(['am nonField error'])
        );

        expect(f.asString()).toEqual('0: bar; 1: swag ded');
        expect(f.toString()).toEqual(f.asString());
        expect(`${f}`).toEqual(f.asString());
    });

    test('ListValidationError - asString glue', () => {
        const f = new ListValidationError(
            [
                new SingleValidationError(['bar']),
                new SingleValidationError(['swag', 'ded']),
            ],
            new SingleValidationError(['am nonField error'])
        );

        expect(f.asString('+')).toEqual('0: bar+1: swag ded');
    });

    test('ValidationError - simple', () => {
        const f = new ValidationError(
            {
                foo: new SingleValidationError(['bar']),
                yolo: new SingleValidationError(['swag', 'ded']),
            },
            new SingleValidationError(['am nonField error'])
        );

        expect(f.asString()).toEqual(
            'am nonField error; foo: bar; yolo: swag ded'
        );
        expect(f.toString()).toEqual(f.asString());
        expect(`${f}`).toEqual(f.asString());
    });

    test('ValidationError - w/o nonFields', () => {
        const f = new ValidationError(
            {
                foo: new SingleValidationError(['bar']),
                yolo: new SingleValidationError(['swag', 'ded']),
            },
            null
        );

        expect(f.asString()).toEqual('foo: bar; yolo: swag ded');
        expect(f.toString()).toEqual(f.asString());
        expect(`${f}`).toEqual(f.asString());
    });

    test('ValidationError - asString glue', () => {
        const f = new ValidationError(
            {
                foo: new SingleValidationError(['bar']),
                yolo: new SingleValidationError(['swag', 'ded']),
            },
            new SingleValidationError(['am nonField error'])
        );

        expect(f.asString('+')).toEqual(
            'am nonField error+foo: bar+yolo: swag ded'
        );
    });
});

describe('ValidationError helper methods', () => {
    test('getError works', () => {
        expectParentValidationError(instance, 'password', {
            strVal: 'too short. missing numbers.',
            type: SingleValidationError,
        });

        expectParentValidationError(instance, 'remember', {
            strVal: 'false',
            type: SingleValidationError,
        });
    });

    test('nested getError works', () => {
        expectParentValidationError(instance, 'email', {
            type: ValidationError,
        });

        expectParentValidationError(instance.getError('email'), 'something', {
            strVal: 'be wrong yo',
            type: SingleValidationError,
        });

        expectValidationError(instance.getError(['email', 'something']), {
            strVal: 'be wrong yo',
            type: SingleValidationError,
        });
    });

    test('ListValidationError getError works', () => {
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
            strVal:
                'zip: Please enter a valid address; country: This field is required. Please select a valid country.',
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
    });

    test('getError - allowNonField flag', () => {
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
        expect(noErr.nonFieldErrors).toBeNull();
        expect(noErr.getError('foo')).toBeNull();
        expect(noErr.getError('foo', true)).toBeNull();
    });

    test('ValidationError firstError works', () => {
        expect(instance.firstError).toBeFunction();

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
        expect(noErr.firstError()).toBeNull();
        expect(noErr.firstError(true)).toBeNull();
    });

    test('ListValidationError firstError works', () => {
        expectParentValidationError(instance, 'deliveryAddress', {
            type: ListValidationError,
        });

        const dError = instance.getError(
            'deliveryAddress'
        ) as ListValidationError;
        expect(dError.firstError).toBeFunction();

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
        expect(noErr.firstError()).toBeNull();
        expect(noErr.firstError(true)).toBeNull();
    });
});

describe('iteration api', () => {
    test('ListValidationError - spread', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);

        const f = new ListValidationError([err1, err2]);

        expect([...f]).toIncludeSameMembers([err1, err2]);
    });

    test('ListValidationError - for .. of', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);
        const err3 = new SingleValidationError(['last']);

        const f = new ListValidationError([err1, err2, err3]);

        const expected = ['bar', 'swag ded', 'last'];

        for (const error of f) {
            expect(error.fieldName).not.toEqual(undefined);
            expect(expected[error.fieldName]).not.toEqual(undefined);

            // access via f.errors
            expect(`${f.errors[error.fieldName]}`).toEqual(
                expected[error.fieldName]
            );

            // access via f.getError()
            expect(`${f.getError(error.fieldName)}`).toEqual(
                expected[error.fieldName]
            );
        }

        // Checks that we can break the for .. of loop
        for (const x of f) {
            expect(x).toEqual(err1);
            break;
        }
    });

    test('ValidationError - spread', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);

        const f = new ValidationError(
            {
                err1,
                err2,
            },
            new SingleValidationError(['am nonField error'])
        );

        expect([...f]).toIncludeSameMembers([err1, err2]);
    });

    test('ValidationError - for .. of', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);

        const f = new ValidationError(
            {
                foo: err1,
                yolo: err2,
            },
            new SingleValidationError(['am nonField error'])
        );

        const expected: {
            [key: string]: string;
        } = {
            foo: 'bar',
            yolo: 'swag ded',
        };

        for (const error of f) {
            expect(error.fieldName).not.toEqual(undefined);
            expect(expected[error.fieldName]).not.toEqual(undefined);

            // tostring is correct
            expect(`${error}`).toEqual(expected[error.fieldName]);

            // access via f.errors
            expect(`${f.errors[error.fieldName]}`).toEqual(
                expected[error.fieldName]
            );

            // access via f.getError()
            expect(`${f.getError(error.fieldName)}`).toEqual(
                expected[error.fieldName]
            );
        }

        // Checks that we can break the for .. of loop
        for (const x of f) {
            expect(x).toEqual(err1);
            break;
        }
    });

    test('SingleValidationError - map', () => {
        const f = new SingleValidationError(['bar', 'baz']);

        const spyFn = jest.fn();
        f.map(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual('bar');
        expect(spyFn.mock.calls[1][0]).toEqual('baz');
    });

    test('ListValidationError - map', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);

        const f = new ListValidationError([err1, err2]);

        const spyFn = jest.fn();
        f.map(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual(err1);
        expect(spyFn.mock.calls[1][0]).toEqual(err2);
    });

    test('ValidationError - map', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);
        const nonFieldErr = new SingleValidationError(['am nonField error']);

        const f = new ValidationError({ err1, err2 }, nonFieldErr);

        const spyFn = jest.fn();
        f.map(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual(err1);
        expect(spyFn.mock.calls[1][0]).toEqual(err2);
    });

    test('SingleValidationError - forEach', () => {
        const f = new SingleValidationError(['bar', 'baz']);

        const spyFn = jest.fn();
        f.forEach(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual('bar');
        expect(spyFn.mock.calls[1][0]).toEqual('baz');
    });

    test('ListValidationError - forEach', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);

        const f = new ListValidationError([err1, err2]);

        const spyFn = jest.fn();
        f.forEach(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual(err1);
        expect(spyFn.mock.calls[1][0]).toEqual(err2);
    });

    test('ValidationError - forEach', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);
        const nonFieldErr = new SingleValidationError(['am nonField error']);

        const f = new ValidationError({ err1, err2 }, nonFieldErr);

        const spyFn = jest.fn();
        f.forEach(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual(err1);
        expect(spyFn.mock.calls[1][0]).toEqual(err2);
    });

    test('SingleValidationError - filter', () => {
        const f = new SingleValidationError(['bar', 'baz']);

        const spyFn = jest.fn((__: string) => false);
        const res = f.filter(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual('bar');
        expect(spyFn.mock.calls[1][0]).toEqual('baz');
        expect(res).toBeArrayOfSize(0);
    });

    test('ListValidationError - filter', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);

        const f = new ListValidationError([err1, err2]);

        const spyFn = jest.fn((__: string) => false);
        const res = f.filter(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual(err1);
        expect(spyFn.mock.calls[1][0]).toEqual(err2);
        expect(res).toBeArrayOfSize(0);
    });

    test('ValidationError - filter', () => {
        const err1 = new SingleValidationError(['bar']);
        const err2 = new SingleValidationError(['swag', 'ded']);
        const nonFieldErr = new SingleValidationError(['am nonField error']);

        const f = new ValidationError({ err1, err2 }, nonFieldErr);

        const spyFn = jest.fn((__: string) => false);
        const res = f.filter(spyFn);

        expect(spyFn.mock.calls[0][0]).toEqual(err1);
        expect(spyFn.mock.calls[1][0]).toEqual(err2);
        expect(res).toBeArrayOfSize(0);
    });
});
