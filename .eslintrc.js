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
        "@typescript-eslint/ban-types": [
            "error",
            {
                "extendDefaults": true,
                "types": {
                    "Function": false,
                    "object": false,
                    "Object": false
                }
            }
        ],
        "@typescript-eslint/brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],
        "@typescript-eslint/explicit-function-return-type": [
            "warn",
            {
                "allowExpressions": true,
                "allowTypedFunctionExpressions": true
            }
        ],
        "@typescript-eslint/explicit-member-accessibility": [
            "warn", {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-floating-promises": [
            "warn", { "ignoreVoid": true }
        ],
        "@typescript-eslint/no-inferrable-types": [
            "warn",
            {
                "ignoreParameters": true,
                "ignoreProperties": true
            }
        ],
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-misused-promises": [
            "warn",
            {
                "checksVoidReturn": false
            }
        ],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                "args": "none"
            }
        ],
        "@typescript-eslint/no-useless-constructor": "warn",
        "@typescript-eslint/prefer-readonly": "warn",
        "@typescript-eslint/promise-function-async": "off",
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/return-await": "warn",
        "@typescript-eslint/semi": ["warn", "always"],
        "@typescript-eslint/space-before-function-paren": [
            "warn",
            {
                "named": "never",
                "anonymous": "never",
                "asyncArrow": "always"
            }
        ],
        "dot-location": [ "warn", "property" ],
        "eol-last": "warn",
        "eqeqeq": [
            "warn",
            "always", {
                "null": "ignore"
            }
        ],
        "grouped-accessor-pairs": "warn",
        "key-spacing": "warn",
        "linebreak-style": [ "warn", "unix" ],
        "max-len": [
            "warn",
            {
                "code": 160,
                "ignoreRegExpLiterals": true
            }
        ],
        "no-case-declarations": "warn",
        "no-constant-condition": [
            "warn",
            {
                "checkLoops": false
            }
        ],
        "no-extra-boolean-cast": "warn",
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
        "semi": "warn"
    }
};
module.exports = config;
