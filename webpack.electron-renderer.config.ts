// cSpell:disable

import {Configuration} from "webpack";

import { typeScriptRules as rules } from "./webpack.rules";
import { default as plugins } from "./webpack.plugins";

const config: Configuration = {
    resolve: {
        extensions: [".ts", ".js"],
    },
    //target: ["electron-renderer", "electron-preload"],
    module: {
        rules: rules
    },
    plugins: plugins
};
export default config;
