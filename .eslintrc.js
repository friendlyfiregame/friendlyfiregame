// cSpell:disable
// @ts-check

/** @type {import("eslint").ESLint.ConfigData} */
const config = {
    "root": true,
    "parserOptions": {
        "tsconfigRootDir": __dirname,
        "ecmaVersion": 2022,
        "sourceType": "module",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": false,
            "globalReturn": false,
            "impliedStrict": true,
            "jsx": false
        }
    },
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
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": "off",
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
        "prefer-regex-literals": "warn",
        "quotes": [ "error", "double" ],
        "semi": "off"
    }
};
module.exports = config;
