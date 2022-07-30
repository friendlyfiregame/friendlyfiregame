// cSpell:disable
// @ts-check

const sonarScannerEnabled = (!!process.env.SONAR_SCANNER_ENABLED && process.env.SONAR_SCANNER_ENABLED !== "false") || false;

/** @type {import("jest").Config} */
const config = {
  "projects": [
    {
      "displayName": "electron",
      "runner": "@jest-runner/electron",
      "testEnvironment": "@jest-runner/electron/environment",
      "testMatch": [
        "<rootDir>/lib/test/**/*.test.js"
      ],
      "sdfsdf": "sdfsdf",
      //"testResultsProcessor": sonarScannerEnabled ? "jest-sonar-reporter" : null
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
