/** Jest config — unit tests (jest-expo). E2E (Playwright) fica em ./e2e e não é coberto aqui. */
module.exports = {
  preset: 'jest-expo',
  // jsdom evita o erro de `localStorage` nativo do Node 25 no jest-environment-node.
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
};
