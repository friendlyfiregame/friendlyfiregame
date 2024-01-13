// cSpell:disable
import { Configuration } from "webpack";

import { typeScriptRules as rules } from "./webpack.rules";

const config: Configuration = {
    target: "electron-preload",
    resolve: {
        extensions: [".ts", "..."],
    },
    devtool: "source-map",
    module: {
        rules: rules()
    }
};
export default config;
