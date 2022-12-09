// cSpell:disable
import { default as process } from "node:process";
import { default  as path } from "node:path";
import { Configuration } from "webpack";
import "webpack-dev-server";

import { default as HtmlWebpackPlugin } from "html-webpack-plugin";

import { typeScriptRules as rules } from "./webpack.rules";
import { default as plugins } from "./webpack.plugins";

type NodeEnv = Configuration["mode"];

plugins.push(new HtmlWebpackPlugin({
    template: "./index.html",
    inject: "body",
    scriptLoading: "defer"
}));

const mode = ((nodeEnv: string|undefined, defaultEnv: NodeEnv): NodeEnv => (
    nodeEnv !== undefined && ["production", "development", "none" ].includes(nodeEnv)) ?
        nodeEnv as Configuration["mode"] :
        defaultEnv)(process.env.NODE_ENV, "production");

export const webConfiguration: Configuration = {
    mode: mode,
    target: "web",
    entry: "./src/web/FriendlyFire.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "index.js",
        chunkFilename: "[name].js?m=[chunkhash]",
        hashFunction: "sha256"
    },
    resolve: {
        extensions: [".ts", "..."]
    },
    devServer: {
        liveReload: true,
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
    performance: {
        maxAssetSize: 16777216,
        maxEntrypointSize: 16777216
    },
    module: {
        rules: rules(path.resolve(__dirname, "src", "web", "tsconfig.json"))
    },
    plugins: plugins
};

export const serviceWorkerConfiguration: Configuration = {
    mode: mode,
    target: "webworker",
    entry: "./src/service-worker/index.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "service-worker.js",
        chunkFilename: "[name].js?m=[chunkhash]",
        hashFunction: "sha256"
    },
    resolve: {
        extensions: [".ts", "..."]
    },
    devtool: "source-map",
    module: {
        rules: rules(path.resolve(__dirname, "src", "service-worker", "tsconfig.json"))
    }
};

export default [
    webConfiguration,
    serviceWorkerConfiguration
];
