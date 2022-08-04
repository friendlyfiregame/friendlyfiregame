// cSpell:disable
// @ts-check

/** @type {import("webpack").Configuration} */
const config = {
    mode: "production",
    entry: "./lib/main.js",
    devtool: false,
    target: "electron-main",
    node: {
      __dirname: false,
    },
    module: {
        rules: [
            {
                // We're specifying native_modules in the test because the asset
                // relocator loader generates a "fake" .node file which is really
                // a cjs file.
                test: /native_modules\/.+\.node$/,
                use: 'node-loader',
              },
              {
                test: /\.(m?js|node|so|dll|dylib)$/,
                parser: { amd: false },
                use: {
                  loader: '@vercel/webpack-asset-relocator-loader',
                  options: {
                    outputAssetBase: 'native_modules',
                  },
                },
              },
        ],
    }
};
module.exports = config;
