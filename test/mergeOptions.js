import { expect } from 'chai';

import { mergeOptions } from '../src/util';


export default {
    'mergeOptions api': {
        'assigns values'() {
            expect(mergeOptions(
                { foo: 1 },
                { bar: 1 },
                { baz: 1 }
            )).to.deep.equal({
                foo: 1,
                bar: 1,
                baz: 1
            });
        },
        'statusSuccess is converted to an array'() {
            expect(mergeOptions(
                { statusSuccess: 200 }
            )).to.deep.equal({
                statusSuccess: [200]
            });
        },
        'statusValidationError is converted to an array'() {
            expect(mergeOptions(
                { statusValidationError: 400 }
            )).to.deep.equal({
                statusValidationError: [400]
            });
        },
        'overwrite order is LTR'() {
            expect(mergeOptions(
                { foo: 1 },
                { foo: 2 },
                { foo: 3 }
            )).to.deep.equal({
                foo: 3
            });

            expect(mergeOptions(
                { statusSuccess: 200 },
                { statusSuccess: 201 },
                { statusSuccess: 202 },
            )).to.deep.equal({
                statusSuccess: [202]
            });

            expect(mergeOptions(
                { statusValidationError: 400 },
                { statusValidationError: 401 },
                { statusValidationError: 402 },
            )).to.deep.equal({
                statusValidationError: [402]
            });
        },
    }
};
