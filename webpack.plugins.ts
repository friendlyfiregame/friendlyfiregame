import { WebpackPluginInstance } from "webpack";

import { default as CopyPlugin } from "copy-webpack-plugin";
import { default as GenerateJsonPlugin } from "generate-json-webpack-plugin";
import { default as ForkTsCheckerWebpackPlugin } from "fork-ts-checker-webpack-plugin";
import { GitRevisionPlugin } from "git-revision-webpack-plugin";

const gitRevisionPlugin = new GitRevisionPlugin();

const plugins: WebpackPluginInstance[] = [
    (new GenerateJsonPlugin("appinfo.json", {
        version: process.env.npm_package_version,
        gitCommitHash: gitRevisionPlugin.commithash()
    }) as any),
    new ForkTsCheckerWebpackPlugin({
        logger: "webpack-infrastructure"
    }),
    new CopyPlugin({
        patterns: [
            { from: "assets/", to: "assets/" },
            { from: "style.css" },
            { from: "manifest.webmanifest" }
        ]
    }),
    gitRevisionPlugin
];

export default plugins;
