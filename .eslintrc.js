// @ts-check

module.exports = {
    extends: ['@thorgate/eslint-config-typescript'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.eslint.json', './packages/**/tsconfig.json'],
    },
    env: {
        es6: true,
        browser: true,
        node: true,
        jest: true,
    },
    rules: {
        'prettier/prettier': 'error',

        'no-underscore-dangle': 'off',
        'max-classes-per-file': 'off',
        '@typescript-eslint/no-explicit-any': 'off', // warn
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],

        'react/no-unescaped-entities': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
