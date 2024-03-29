import { Configuration } from "webpack";

import { typeScriptRules as rules } from "./webpack.rules";
import plugins from "./webpack.plugins";

const config: Configuration = {
    target: "electron-renderer",
    resolve: {
        extensions: [".ts", "..."],
    },
    devtool: "source-map",
    module: {
        rules: rules()
    },
    plugins: plugins
};
export default config;
