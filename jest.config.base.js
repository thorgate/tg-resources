/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
    verbose: true,
    cache: false,

    preset: 'ts-jest',

    testMatch: ['<rootDir>/test/*.test.ts?(x)'],

    globals: {
        'ts-jest': {
            tsconfig: {
                sourceMap: true,
            },
        },
    },
};

module.exports = config;
