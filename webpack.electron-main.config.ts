// cSpell:disable

import { Configuration } from "webpack";
import { typeScriptRules, nativeModuleRules } from "./webpack.rules";

const config: Configuration = {
    entry: "./src/electron-main.ts",
    target: "electron-main",
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: typeScriptRules.concat(nativeModuleRules)
    }
};
export default config;
