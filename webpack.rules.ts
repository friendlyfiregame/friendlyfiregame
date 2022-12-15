import { default as path } from "node:path";
import { RuleSetRule } from "webpack";
import { Options as TypeScriptLoaderOptions } from "ts-loader";

export function typeScriptRules(configFile: string = path.resolve(".", "tsconfig.json")): RuleSetRule[] {
    return [
        {
            test: /\.(tsx?)$/,
            exclude: /(node_modules|\.webpack)/,
            enforce: "pre",
            use: {
              loader: "ts-loader",
              options: {
                projectReferences: true,
                transpileOnly: false,
                configFile: configFile
              } as TypeScriptLoaderOptions
            }
          }
    ];
}


export function svgRules(): RuleSetRule[] {
  return [
      {
          test: /\.(svg)$/,
          enforce: "pre",
          use: {
            loader: "raw-loader"
          }
        }
  ];
}

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
