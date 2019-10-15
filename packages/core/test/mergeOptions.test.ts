import { mergeConfig } from '../src';

describe('mergeConfig api', () => {
    test('assigns values', () => {
        expect(
            mergeConfig(
                { apiRoot: '' },
                { withCredentials: true },
                { allowAttachments: false }
            )
        ).toMatchObject({
            apiRoot: '',
            withCredentials: true,
            allowAttachments: false,
        });
    });

    test('statusSuccess is converted to an array', () => {
        expect(mergeConfig({ statusSuccess: 200 })).toMatchObject({
            statusSuccess: [200],
        });
    });

    test('statusValidationError is converted to an array', () => {
        expect(mergeConfig({ statusValidationError: 400 })).toMatchObject({
            statusValidationError: [400],
        });
    });

    test('signal is typechecked', () => {
        expect(() => {
            mergeConfig({ signal: new Error('fake') as any });
        }).toThrow(/Expected signal to be an instanceof AbortSignal/);
    });

    test('overwrite order is LTR', () => {
        expect(
            mergeConfig(
                { apiRoot: '' },
                { apiRoot: '/api/' },
                { apiRoot: '/test/' }
            )
        ).toMatchObject({
            apiRoot: '/test/',
        });

        expect(
            mergeConfig(
                { statusSuccess: 200 },
                { statusSuccess: 201 },
                { statusSuccess: 202 }
            )
        ).toMatchObject({
            statusSuccess: [202],
        });

        expect(
            mergeConfig(
                { statusValidationError: 400 },
                { statusValidationError: 401 },
                { statusValidationError: 402 }
            )
        ).toMatchObject({
            statusValidationError: [402],
        });
    });
});
