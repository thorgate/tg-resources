/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    projects: ['<rootDir>/packages/*'],
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
};
