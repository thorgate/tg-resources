/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
    verbose: true,
    cache: false,

    preset: 'ts-jest',

    testMatch: ['<rootDir>/test/*.test.ts?(x)'],
};

module.exports = config;
