// Jest config defaults
const { defaults } = require('jest-config');

const config = {
    cache: false,

    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],

    transform: { '.(ts|tsx)': 'ts-jest' },

    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],

    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',
        '\\.(js|jsx)$',
    ],

    testMatch: ['<rootDir>/test/*.test.ts?(x)'],
};

module.exports = config;
