// cSpell:disable
import { default  as path } from "node:path";
import { Configuration } from "webpack";
import "webpack-dev-server";

import { default as HtmlWebpackPlugin } from "html-webpack-plugin";

import { typeScriptRules as rules } from "./webpack.rules";
import { default as plugins } from "./webpack.plugins";

plugins.push(new HtmlWebpackPlugin({
    template: "./index.html",
    inject: "body",
    scriptLoading: "defer"
}));

const configuration: Configuration = {
    target: "web",
    entry: "./src/FriendlyFire.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "index.js",
        chunkFilename: "[name].js?m=[chunkhash]",
        hashFunction: "sha256"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    devServer: {
        host: "0.0.0.0",
        port: 8000,
        compress: true,
        allowedHosts: ["*"],
        static: {
            directory: "./dist",
            watch: {
                usePolling: false
            }
        },
    },
    devtool: "source-map",
    stats: {
        warningsFilter: /System.import/
    },
    performance: {
        maxAssetSize: 16777216,
        maxEntrypointSize: 16777216
    },
    module: {
        rules: rules
    },
    plugins: plugins
};
export default [configuration];
