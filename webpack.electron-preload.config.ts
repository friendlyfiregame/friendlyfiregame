// cSpell:disable
import { default as path } from "node:path";
import { Configuration } from "webpack";

import { typeScriptRules as rules } from "./webpack.rules";

const config: Configuration = {
    target: "electron-preload",
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: rules(path.resolve("src", "electron-preload", "tsconfig.json"))
    }
};
export default config;
