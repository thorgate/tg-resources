/* eslint-disable @typescript-eslint/no-var-requires */
// Jest config defaults
const { defaults } = require('jest-config');

const config = {
    verbose: true,
    cache: false,

    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],

    transform: {
        '\.tsx?$': 'ts-jest',
        '\.jsx?$': 'babel-jest',
    },

    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],

    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',
        '\\.(js|jsx)$',
    ],

    testMatch: ['<rootDir>/test/*.test.ts?(x)'],
};

module.exports = config;
