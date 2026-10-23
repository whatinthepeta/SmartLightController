/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    nodeOptions: ['--localstorage-file=/tmp/jest-localstorage.db'],
  },
};
