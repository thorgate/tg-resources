import { expect } from 'chai';

import { mergeConfig } from '../src/util';


export default {
    'mergeConfig api': {
        'assigns values': () => {
            expect(mergeConfig(
                { foo: 1 },
                { bar: 1 },
                { baz: 1 },
            )).to.deep.equal({
                foo: 1,
                bar: 1,
                baz: 1,
            });
        },
        'statusSuccess is converted to an array': () => {
            expect(mergeConfig(
                { statusSuccess: 200 },
            )).to.deep.equal({
                statusSuccess: [200],
            });
        },
        'statusValidationError is converted to an array': () => {
            expect(mergeConfig(
                { statusValidationError: 400 },
            )).to.deep.equal({
                statusValidationError: [400],
            });
        },
        'overwrite order is LTR': () => {
            expect(mergeConfig(
                { foo: 1 },
                { foo: 2 },
                { foo: 3 },
            )).to.deep.equal({
                foo: 3,
            });

            expect(mergeConfig(
                { statusSuccess: 200 },
                { statusSuccess: 201 },
                { statusSuccess: 202 },
            )).to.deep.equal({
                statusSuccess: [202],
            });

            expect(mergeConfig(
                { statusValidationError: 400 },
                { statusValidationError: 401 },
                { statusValidationError: 402 },
            )).to.deep.equal({
                statusValidationError: [402],
            });
        },
    },
};
