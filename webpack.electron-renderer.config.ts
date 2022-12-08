// cSpell:disable
import { default as path } from "node:path";
import { Configuration } from "webpack";

import { typeScriptRules as rules } from "./webpack.rules";
import { default as plugins } from "./webpack.plugins";

const config: Configuration = {
    target: "electron-renderer",
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: rules(path.resolve("src", "web", "tsconfig.json"))
    },
    plugins: plugins
};
export default config;
