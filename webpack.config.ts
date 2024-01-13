// cSpell:disable
import { default  as path } from "node:path";
import { Configuration, DefinePlugin } from "webpack";
import { Configuration as DevServerConfiguration } from "webpack-dev-server";

import { default as HtmlWebpackPlugin } from "html-webpack-plugin";

import { typeScriptRules, svgRules } from "./webpack.rules";
import { default as plugins } from "./webpack.plugins";

type Mode = Configuration["mode"];

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

export default (
    env: { WEBPACK_SERVE?: boolean },
    { mode = "production", devtool = (mode === "development" ? "inline-source-map" : "source-map") }: { mode: Mode, devtool: string }
): Configuration[] => [
    {
        name: "web",
        mode,
        target: "web",
        entry: "./src/web/FriendlyFire.ts",
        output: {
            path: path.join(__dirname, "dist"),
            filename: "index.js",
            chunkFormat: "array-push",
            hashFunction: "sha256"
        },
        resolve: {
            extensions: [".ts", "..."],
            fallback: {
                processs: false
            }
        },
        devServer: devServerConfiguration,
        devtool,
        performance: {
            maxAssetSize: 16777216,
            maxEntrypointSize: 16777216
        },
        module: {
            rules: typeScriptRules()
        },
        plugins: [
            ...plugins,
            new HtmlWebpackPlugin({
                template: "./index.html",
                inject: "body",
                scriptLoading: "defer",
            }),
            new DefinePlugin({
                "process.env": {
                    "MODE": JSON.stringify(mode)
                }
            })
        ],
        dependencies: [ "service-worker" ]
    },
    {
        name: "touch-controls",
        mode,
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
        devtool,
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
    },
    {
        name: "service-worker",
        mode,
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
        devtool,
        module: {
            rules: typeScriptRules()
        }
    }
];
