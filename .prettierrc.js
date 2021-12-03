const parent = require('@thorgate/prettier-config');

module.exports = {
    ...parent,
    overrides: [
        {
            files: ['*.json', '**/*.json', '*/test-server/package.json'],
            options: {
                tabWidth: 2,
            },
        },
        ...parent.overrides,
    ],
};
