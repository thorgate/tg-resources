/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    bail: true,
    verbose: true,
    projects: ['<rootDir>/packages/*'],
    preset: 'ts-jest',
    testEnvironment: 'node',
};
