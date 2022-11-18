// cSpell:disable

import * as path from "node:path";
import {Configuration} from "webpack";
import {default as HtmlWebpackPlugin} from "html-webpack-plugin";
import {default as CopyPlugin} from "copy-webpack-plugin";
import GenerateJsonPlugin from "generate-json-webpack-plugin";
import {GitRevisionPlugin} from "git-revision-webpack-plugin";
const gitRevisionPlugin = new GitRevisionPlugin();

const config: Configuration = {
    mode: "production",
    devtool: false,
    resolve: {
        extensions: [".ts", ".js"],
        modules: [
            "./src",
            "node_modules"
        ],
        symlinks: false
    },
    target: "electron-renderer",
    amd: false,
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                use: "ts-loader",
                exclude: /node_modules/,
                enforce: "pre"
            }
        ]
    },
    plugins: [
        (new GenerateJsonPlugin("appinfo.json", {
            version: process.env.npm_package_version,
            gitCommitHash: gitRevisionPlugin.commithash()
        }) as any),
        new HtmlWebpackPlugin({
            template: "./src/index.html.ejs",
            inject: "body",
            scriptLoading: "defer"
        }),
        new CopyPlugin({
            patterns: [
                { from: "assets/", to: "assets/" },
                { from: "style.css" },
                { from: "manifest.webmanifest" }
            ]
        })
    ]
};
export default config;
