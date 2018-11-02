// Jest config defaults
const { defaults } = require('jest-config');
const semver = require('semver');


const config = {
    cache: false,

    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/node_modules/**',
    ],

    transform: { '.(ts|tsx)': 'ts-jest' },

    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],

    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$', '\\.(js|jsx)$'],

    testMatch: [
        '<rootDir>/test/*.test.ts?(x)',
    ],
};


if (semver.gte(process.version, '6.14.0') && semver.lt(process.version, '8.0.0')) {
    config.globals = {
        'ts-jest': {
            babelConfig: {
                plugins: ['@babel/plugin-transform-async-to-generator'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                node: 'current',
                            },
                            'useBuiltIns': 'usage',
                        },
                    ],
                ],
            },
        },
    };
}


module.exports = config;
