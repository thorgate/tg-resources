module.exports = {
    bail: true,
    verbose: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],
    transform: { '.(ts|tsx)': 'ts-jest' },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$', '\\.(js|jsx|json)$'],
    projects: ['<rootDir>/packages/*'],
};
