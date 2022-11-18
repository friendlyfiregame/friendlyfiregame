import * as fs from "node:fs";
import * as path from "node:path";

import * as semver from "semver";
import * as git from "git-rev-sync";

import {ForgeConfig, ForgePlatform, ForgeArch} from "@electron-forge/shared-types";

// Plugins
import {WebpackPlugin} from "@electron-forge/plugin-webpack";
import {AutoUnpackNativesPlugin} from "@electron-forge/plugin-auto-unpack-natives";

// Makers
import {MakerSquirrel} from "@electron-forge/maker-squirrel";
import {MakerZIP} from "@electron-forge/maker-zip";
import {MakerDeb} from "@electron-forge/maker-deb";
import {MakerRpm} from "@electron-forge/maker-rpm";

// Publishers
import {PublisherGithub} from "@electron-forge//publisher-github";

// Webpack configurations
import webpackMainConfig from "./webpack.main.config";
import webpackRendererConfig from "./webpack.renderer.config";

const productName = "Friendly Fire";
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json")).toString());
const appVersion = packageJson.version;
const appHomepage = packageJson.homepage;

const config: ForgeConfig = {
    hooks: {
        prePackage: async (config: ForgeConfig, platform: ForgePlatform, arch: ForgeArch): Promise<void> => {
            // Package name for macOS and Windows should be different.
            if (["darwin", "win32"].includes(platform)) {
                config.packagerConfig!.name = "Friendly Fire";
            }
        }
    },
    packagerConfig: {
        // cspell:disable
        asar: {
            unpack: "*.{dll,dylib,node,so}"
        },
        // cspell:enable
        // https://electron.github.io/electron-packager/master/interfaces/electronpackager.win32metadataoptions.html
        win32metadata: {
            FileDescription: "A small 2d platform adventure game with handcrafted pixel art, an original soundtrack and lots of love put into the creation of the characters and dialogs.",
            ProductName: "Friendly Fire",
            "requested-execution-level": "asInvoker",
        },
        icon: path.resolve(__dirname, "assets", "appicon.iconset"),
        appCopyright: "Copyright (C) 2020–2022 Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
        "Klaus Reimer and Jennifer van Veen",
        appVersion: appVersion,
        appBundleId: "com.friendlyfiregame",
        appCategoryType: "public.app-category.games",
        buildVersion: `${appVersion}+build-${git.short()}`,
        darwinDarkModeSupport: true,
        name: "friendlyfiregame",
        executableName: "friendlyfiregame"
    },
    makers: [
      new MakerSquirrel({
        name: "friendlyfire",
        version: appVersion,
        usePackageJson: true,
      }),
      new MakerZIP(),
      new MakerDeb({
        options: {
            icon: "./assets/appicon.iconset/icon_256x256.png",
            name: "friendlyfiregame",
            productName: productName,
            genericName: productName,
            categories: [
                "Game"
            ],
            homepage: appHomepage,
            version: appVersion
        },
      }),
      new MakerRpm({
        options: {
            icon: "./assets/appicon.iconset/icon_256x256.png",
            name: "friendlyfiregame",
            productName: productName,
            genericName: productName,
            categories: [
                "Game"
            ],
            homepage: appHomepage,
            version: appVersion
        }
      }),
    ],
    plugins: [
      new AutoUnpackNativesPlugin({}),
      new WebpackPlugin({
        mainConfig: webpackMainConfig,
        jsonStats: false,
        packageSourceMaps: true,
        renderer: {
          nodeIntegration: false,
          jsonStats: false,
          config: webpackRendererConfig,
          entryPoints: [
            {
              js: "./src/FriendlyFire.ts",
              name: "./",
              nodeIntegration: false,
              preload: {
                  js: "./src/electron-preload.ts"
              }
            }
          ]
        }
      })
    ],
    publishers: [
        new PublisherGithub({
            repository: {
                owner: "friendlyfiregame",
                name: "friendlyfiregame"
            },
            tagPrefix: "v",
            prerelease: (semver.parse(appVersion)?.prerelease.length || []) > 0,
            draft: true
        })
    ]
};
export default config;
