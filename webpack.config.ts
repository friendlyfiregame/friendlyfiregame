// cSpell:disable
import { default as process } from "node:process";
import { default  as path } from "node:path";
import { Configuration } from "webpack";
import { Configuration as DevServerConfiguration } from "webpack-dev-server";

import { default as HtmlWebpackPlugin } from "html-webpack-plugin";

import { typeScriptRules, svgRules } from "./webpack.rules";
import { default as plugins } from "./webpack.plugins";

type NodeEnv = Configuration["mode"];

const mode = ((nodeEnv: string|undefined, defaultEnv: NodeEnv): NodeEnv => (
    nodeEnv !== undefined && ["production", "development", "none" ].includes(nodeEnv)) ?
        nodeEnv as Configuration["mode"] :
        defaultEnv)(process.env.NODE_ENV, "production");

const devServerConfiguration: DevServerConfiguration = {
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
};

export const webConfiguration: Configuration = {
    name: "web",
    mode: mode,
    target: "web",
    entry: "./src/web/FriendlyFire.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "index.js",
        chunkFormat: "array-push",
        hashFunction: "sha256"
    },
    resolve: {
        extensions: [".ts", "..."]
    },
    devServer: devServerConfiguration,
    devtool: "source-map",
    performance: {
        maxAssetSize: 16777216,
        maxEntrypointSize: 16777216
    },
    module: {
        rules: typeScriptRules()
    },
    plugins: plugins.concat([new HtmlWebpackPlugin({
        template: "./index.html",
        inject: "body",
        scriptLoading: "defer",
    })]),
    dependencies: [ "service-worker" ]
};

export const touchControlsConfiguration: Configuration = {
    name: "touch-controls",
    mode: mode,
    watchOptions: {
        aggregateTimeout: 150,
        poll: false,
        ignored: [
            "**/*.spec.ts",
            "**/*.test.ts",
        ]
    },
    target: "web",
    entry: "./src/touch-controls/index.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "touch-controls.js",
        chunkFilename: "[name].js?m=[chunkhash]",
        hashFunction: "sha256"
    },
    devServer: devServerConfiguration,
    resolve: {
        extensions: [".ts", "..."]
    },
    devtool: "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./touch-controls-test.html",
            filename: "touch-controls-test.html",
            inject: "body",
            scriptLoading: "defer",
        })
    ],
    module: {
        rules: svgRules().concat(typeScriptRules())
    }
};

export const serviceWorkerConfiguration: Configuration = {
    name: "service-worker",
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
        rules: typeScriptRules()
    }
};

export default [
    webConfiguration,
    serviceWorkerConfiguration,
    touchControlsConfiguration
];
