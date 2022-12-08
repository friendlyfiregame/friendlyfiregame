// cSpell:disable
// @ts-check

/** @type {import("jest").Config} */
const config = {
  projects: [
    {
      displayName: "electron",
      runner: '@kayahr/jest-electron-runner',
      testEnvironment: '@kayahr/jest-electron-runner/environment',
      testMatch: [
        "<rootDir>/lib/web/test/**/*.test.js"
      ]
    }
  ],
  collectCoverageFrom: [
    "<rootDir>/lib/web/**/*.js",
    "!<rootDir>/lib/web/test/**"
  ],
  setupFilesAfterEnv: [
    "jest-extended/all"
  ]
};
module.exports = config;
