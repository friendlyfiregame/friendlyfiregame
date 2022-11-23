import { RuleSetRule } from "webpack";

export const typeScriptRules: RuleSetRule[] = [
    {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        enforce: "pre",
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: false,
          },
        },
      },
];

export const nativeModuleRules: RuleSetRule[] = [
    // Add support for native node modules
    {
      // We're specifying native_modules in the test because the asset relocator loader generates a
      // "fake" .node file which is really a cjs file.
      test: /native_modules[/\\].+\.node$/,
      use: {
        loader: "node-loader"
      }
    },
    {
      test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
      parser: { amd: false },
      use: {
        loader: "@vercel/webpack-asset-relocator-loader",
        options: {
          outputAssetBase: "native_modules",
        },
      },
    }
];
