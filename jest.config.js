/** @type {import('jest').Config} */
export const preset = 'ts-jest';
export const testEnvironment = 'jsdom';
export const setupFilesAfterEnv = ['<rootDir>/src/setupTests.ts'];
export const moduleNameMapper = {
  '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/styleMock.ts',
};
export const transform = {
  '^.+\\.(ts|tsx)$': 'ts-jest',
};
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];

export const globals = {
  'ts-jest': {
    tsconfig: 'tsconfig.jest.json',
    // allow TypeScript files with ES imports to be used under Jest (CJS runner)
    verbatimModuleSyntax: false,
    isolatedModules: true,
  },
};
