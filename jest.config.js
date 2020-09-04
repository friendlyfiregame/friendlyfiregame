const sonarScannerEnabled = (!!process.env.SONAR_SCANNER_ENABLED && process.env.SONAR_SCANNER_ENABLED !== "false") || false;

module.exports = {
    "projects": [
    {
      "displayName": "electron",
      "runner": "@jest-runner/electron",
      "testEnvironment": "@jest-runner/electron/environment",
      "testMatch": [
        "<rootDir>/lib/test/**/*.test.js"
      ],
      "testResultsProcessor": sonarScannerEnabled ? "jest-sonar-reporter" : null
    }
  ],
  "collectCoverageFrom": [
    "<rootDir>/lib/**/*.js",
    "!<rootDir>/lib/test/**"
  ]
};
