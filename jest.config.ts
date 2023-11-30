// cSpell:disable

import { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "electron",
      preset: "ts-jest/presets/js-with-ts",
      runner: "@kayahr/jest-electron-runner",
      testEnvironment: "@kayahr/jest-electron-runner/environment",
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

export default config;
