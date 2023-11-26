/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
    cache: false,

    preset: 'ts-jest',

    testMatch: ['<rootDir>/test/*.test.ts?(x)'],

    coveragePathIgnorePatterns: ['node_modules', '<rootDir>/test/'],

    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: {
                    sourceMap: true,
                },
                useESM: true,
                diagnostics: {
                    exclude: ['!**/*.(spec|test).ts'],
                },
            },
        ],
    },
};

module.exports = config;
