import {
    ListValidationError,
    ParentValidationErrorInterface,
    parseErrors,
    SingleValidationError,
    ValidationError,
} from '../src';
import DEFAULTS from '../src/constants';

import {
    expectParentValidationError,
    expectValidationError,
} from './testUtils';

let instance: ParentValidationErrorInterface;

beforeEach(() => {
    const text = JSON.stringify({
        errors: {
            non_field_errors: ['Something is generally broken'],

            password: ['too short', 'missing numbers.'],

            remember: false,

            email: {
                something: 'be wrong yo',
                stripped: null,
            },

            deliveryAddress: [
                {
                    non_field_errors: ['Provided address is not supported'],
                },
                null, // kept as null
                '', // Replaced w/ special #$empty-message$#
                {
                    zip: ['Please enter a valid address'],
                    country: [
                        'This field is required.',
                        'Please select a valid country.',
                    ],
                },
            ],

            coercesToNonField: {},
        },
    });

    instance = parseErrors(text, DEFAULTS) as ParentValidationErrorInterface;
});

describe('parseErrors api -', () => {
    test('invalid json is handled correctly', () => {
        const error = parseErrors('{ asd: 1 ]', DEFAULTS);

        expect(error).toBeInstanceOf(SingleValidationError);
        expect(`${error}`).toEqual('{ asd: 1 ]');
    });

    test('empty error is handled correctly', () => {
        const error = parseErrors(null, DEFAULTS);

        expect(error).toBeNull();
    });

    test('parser conforms to contracts', () => {
        // based on the input the result should be of ValidationError type
        expect(instance).toBeInstanceOf(ValidationError);

        expectParentValidationError(instance, undefined, {
            strVal: 'Something is generally broken',
            type: SingleValidationError,
            allowNonField: true,
        });

        expectParentValidationError(instance, 'password', {
            strVal: 'too short missing numbers.',
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

        // Check array getError
        expectValidationError(instance.getError(['email', 'something']), {
            strVal: 'be wrong yo',
            type: SingleValidationError,
        });
        expectValidationError(instance.getError(['email', 'stripped']), {
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
            strVal:
                'zip: Please enter a valid address; country: This field is required. Please select a valid country.',
            type: ValidationError,
        });
        expectValidationError(instance.getError('deliveryAddress'), {
            strVal:
                '0: Provided address is not supported; 1: null; 2: #$empty-message$#; ' +
                '3: zip: Please enter a valid address; country: This field is required. Please select a valid country.',
            type: ListValidationError,
        });

        expectParentValidationError(instance, 'coercesToNonField', {
            strVal: '',
            type: ValidationError,
        });
    });
});
