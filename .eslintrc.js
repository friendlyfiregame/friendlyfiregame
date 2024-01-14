// @ts-check

/** @type {import("eslint").ESLint.ConfigData} */
const config = {
    "root": true,
    "parserOptions": {
        "tsconfigRootDir": ".",
        "project": "tsconfig.json",
        "ecmaVersion": 2022,
        "sourceType": "module",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": false,
            "globalReturn": false,
            "impliedStrict": true,
            "jsx": false
        }
    },
    "ignorePatterns": [
        "webpack.*.ts",
        "forge.*.ts",
        "jest.config.ts"
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": [
      "@typescript-eslint"
    ],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],
        "@typescript-eslint/explicit-function-return-type": [
            "warn",
            {
                "allowExpressions": true,
                "allowTypedFunctionExpressions": true
            }
        ],
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-floating-promises": [
            "warn", { "ignoreVoid": true }
        ],
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-misused-promises": [
            "warn",
            {
                "checksVoidReturn": false
            }
        ],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/prefer-readonly": "warn",
        "@typescript-eslint/promise-function-async": "off",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/return-await": "warn",
        "@typescript-eslint/semi": ["warn", "always"],
        "dot-location": [ "warn", "property" ],
        "eqeqeq": [
            "warn",
            "always", {
                "null": "ignore"
            }
        ],
        "grouped-accessor-pairs": "warn",
        "max-len": [
            "off",
            {
                "code": 120,
                "ignoreRegExpLiterals": true
            }
        ],
        "no-case-declarations": "off",
        "no-constant-condition": [
            "warn",
            {
                "checkLoops": false
            }
        ],
        "no-extra-boolean-cast": "off",
        "no-new-wrappers": "warn",
        "no-proto": "warn",
        "no-return-assign": "warn",
        "no-return-await": "warn",
        "no-self-compare": "warn",
        "no-sequences": "warn",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "warn",
        "no-unmodified-loop-condition": "warn",
        "no-useless-escape": "off",
        "prefer-promise-reject-errors": "warn",
        "prefer-regex-literals": "warn",
        "quotes": [ "error", "double" ],
        "semi": "off"
    }
};
module.exports = config;
