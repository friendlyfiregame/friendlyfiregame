import * as path from "node:path";
import {Configuration, WebpackPluginInstance} from "webpack";
import "webpack-dev-server";

import {default as CopyPlugin} from "copy-webpack-plugin";
import {default as GenerateJsonPlugin} from "generate-json-webpack-plugin";
import {GitRevisionPlugin} from "git-revision-webpack-plugin";
const gitRevisionPlugin = new GitRevisionPlugin();

const configuration: Configuration = {
    entry: "./lib/FriendlyFire.js",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "FriendlyFire.js",
        chunkFilename: "[name].js?m=[chunkhash]",
        hashFunction: "sha256"
    },
    mode: "development",
    resolve: {
        symlinks: false,
        mainFields: ["browser", "main", "module"]
    },
    devServer: {
        host: "0.0.0.0",
        port: 8000,
        compress: true,
        allowedHosts: ["*"],
        static: {
            directory: path.join(__dirname, "dist"),
            watch: {
                ignored: [
                    path.resolve(__dirname, "src/**/*.ts")
                ],
                usePolling: false
            }
        }
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
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "lib")
                ],
                use: ["source-map-loader"],
                enforce: "pre"
            }
        ]
    },
    plugins: [
        gitRevisionPlugin,
        new GenerateJsonPlugin("appinfo.json", {
            version: process.env.npm_package_version,
            gitCommitHash: gitRevisionPlugin.commithash()
        }) as WebpackPluginInstance,
        new CopyPlugin({ patterns: [
            //{ from: "src/demo/**/*.{html,css}" },
            { from: "assets/", to: "assets/" },
            { from: "index.html", transform(content: any) {
                return content.toString().replace("src=\"node_modules/steal/steal.js\" main=\"lib/FriendlyFire\"",
                    "src=\"FriendlyFire.js\"");
            }},
            { from: "style.css" },
            { from: "manifest.webmanifest" }
        ]})
    ]
};
export default configuration;