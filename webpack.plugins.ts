import { WebpackPluginInstance } from "webpack";

import CopyPlugin from "copy-webpack-plugin";
import GenerateJsonPlugin from "generate-json-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
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
            { from: "manifest.webmanifest", transform: (content) => {
                const json = JSON.parse(content.toString());
                json.id = `?version=${process.env.npm_package_version}+build-${gitRevisionPlugin.commithash()?.substring(0, 7) || "unknown"}`;
                return Buffer.from(JSON.stringify(json));
            }}
        ]
    }),
    gitRevisionPlugin
];

export default plugins;
