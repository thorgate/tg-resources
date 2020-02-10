// @ts-check

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './packages/**/tsconfig.eslint.json'
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
    ],
    plugins: ['prettier', '@typescript-eslint', 'react', 'react-hooks'],
    settings: {
        react: {
            version: '16.12',
        },
    },
    env: {
        es6: true,
        browser: true,
        node: true,
        jest: true,
    },
    rules: {
        'no-console': 'warn',

        'prettier/prettier': 'error',

        '@typescript-eslint/no-explicit-any': 'off', // warn
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/camelcase': [
            'error',
            { allow: ['non_field_errors'] },
        ],
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],

        'react/no-unescaped-entities': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
