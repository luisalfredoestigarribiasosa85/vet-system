module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js',
        'utils/**/*.js',
        'validators/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
    ],
    testMatch: [
        '**/tests/**/*.test.js',
    ],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
};
