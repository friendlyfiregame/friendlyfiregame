// cSpell:disable

import * as path from "node:path";
import {Configuration} from "webpack";

const config: Configuration = {
    mode: "production",
    entry: "./src/electron-main.ts",
    devtool: false,
    target: "electron-main",
    node: {
        __dirname: false,
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: [
            "./src",
            "node_modules"
        ],
        symlinks: false
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                use: ["ts-loader"],
                exclude: /node_modules/,
                enforce: "pre"
            },
            {
                // We're specifying native_modules in the test because the asset
                // relocator loader generates a "fake" .node file which is really
                // a cjs file.
                test: /native_modules\/.+\.node$/,
                use: "node-loader",
            },
            {
                test: /\.(m?js|node|so|dll|dylib)$/,
                parser: { amd: false },
                use: {
                    loader: "@vercel/webpack-asset-relocator-loader",
                    options: {
                        outputAssetBase: "native_modules",
                    }
                }
            }
        ]
    }
};
export default config;
