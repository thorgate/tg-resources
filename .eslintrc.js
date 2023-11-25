// @ts-check

module.exports = {
    extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:jest/recommended',
    ],
    plugins: ['@typescript-eslint', 'jest', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: [
            './tsconfig.eslint.json',
            './packages/**/tsconfig.eslint.json',
        ],
    },
    env: {
        es6: true,
        browser: true,
        'jest/globals': true,
        node: true,
        jest: true,
    },
    globals: {
        DJ_CONST: false,
        django: false,
    },
    rules: {
        'prettier/prettier': 'error',

        'no-underscore-dangle': 'off',
        'max-classes-per-file': 'off',
        'no-restricted-syntax': 'off',

        // route templates use template format
        'no-template-curly-in-string': 'off',

        // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
        'import/prefer-default-export': 'off',

        // Set max line length to 140 chars. Prettier formats to 80.
        // Using this rule so comments would be kept in more readable format
        'max-len': ['warn', 140],

        // else-return improves readability sometimes, especially with one-liners.
        'no-else-return': 'warn',

        // Allow unary ++ operator in for loop afterthoughts
        'no-plusplus': 'off',

        // Turn these into errors
        'no-var': 'error',

        // and disable these
        'class-methods-use-this': 'off',

        // Show TODOs and FIXMEs as warnings
        'no-warning-comments': ['warn', { location: 'anywhere' }],

        // Typescript configuration
        '@typescript-eslint/explicit-module-boundary-types': 'off', // warn
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-explicit-any': 'off', // warn
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],

        // Automatically group import statements by type and sort them alphabetically.
        "import/order": [
            "error",
            {
                "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
                "alphabetize": { "order": "asc", "caseInsensitive": true },
                "newlines-between": "always"
            }
        ],

        // Keep imports in order
        'sort-imports': [
            'error',
            {
                ignoreCase: true,
                ignoreDeclarationSort: true,
            },
        ],

        // jest - fail if no except in tests
        'jest/expect-expect': [
            'error',
            {
                assertFunctionNames: [
                    'expect',
                    'expectConfig',
                    'expectParentValidationError',
                    'expectError',
                    'expectResponse',
                ],
                additionalTestBlockFunctions: [],
            },
        ],
    },
};
