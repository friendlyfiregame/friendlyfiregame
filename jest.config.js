// cSpell:disable
// @ts-check

/** @type {import("jest").Config} */
const config = {
  "projects": [
    {
      "displayName": "electron",
      "runner": "@jest-runner/electron",
      "testEnvironment": "@jest-runner/electron/environment",
      "testMatch": [
        "<rootDir>/lib/test/**/*.test.js"
      ]
    }
  ],
  "collectCoverageFrom": [
    "<rootDir>/lib/**/*.js",
    "!<rootDir>/lib/test/**"
  ],
  "setupFilesAfterEnv": [
    "jest-extended/all"
  ]
};
module.exports = config;
