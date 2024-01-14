import { Configuration } from "webpack";
import { typeScriptRules, nativeModuleRules } from "./webpack.rules";

const config: Configuration = {
    entry: "./src/electron-main/index.ts",
    target: "electron-main",
    resolve: {
        extensions: [".ts", "..."]
    },
    devtool: "source-map",
    module: {
        rules: typeScriptRules().concat(nativeModuleRules)
    }
};
export default config;
