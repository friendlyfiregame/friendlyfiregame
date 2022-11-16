// @ts-check
const { platform } = require("node:os");
const os = require("node:os");
const path = require("node:path");

// Plugins
const WebPackPlugin = require("@electron-forge/plugin-webpack").WebpackPlugin;
const AutoUnpackNativesPlugin = require("@electron-forge/plugin-auto-unpack-natives").AutoUnpackNativesPlugin;

// Makers
const MakerSquirrel = require("@electron-forge/maker-squirrel").MakerSquirrel;
const MakerZIP = require("@electron-forge/maker-zip").MakerZIP
const MakerDeb = require("@electron-forge/maker-deb").MakerDeb;
const MakerRpm = require("@electron-forge/maker-rpm").MakerRpm;

// Package name for macOS should be different.
const packageName = os.platform() === "darwin" ? "Friendly Fire" : "friendlyfire";
const productName = "Friendly Fire";

/** @type {import("electron-packager").Win32MetadataOptions} */
const win32Metadata = {
    FileDescription: "A small 2d platform adventure game with handcrafted pixel art, an original soundtrack and lots of love put into the creation of the characters and dialogs.",
    ProductName: "Friendly Fire",
    "requested-execution-level": "asInvoker"
};

const appVersion = require(path.resolve(__dirname, "package.json")).version;
const appHomepage = require(path.resolve(__dirname, "package.json")).homepage;

/** @type {import("@electron-forge/shared-types").ForgeConfig} */
const config = {
    packagerConfig: {
        // cspell:disable
        asar: {
            unpack: /** @type {any} */ ([
                "*.so",
                "*.dll",
                "*.dylib"
            ])
        },
        // cspell:enable
        name: packageName,
        // https://electron.github.io/electron-packager/master/interfaces/electronpackager.win32metadataoptions.html
        win32metadata: win32Metadata,
        icon: path.resolve(__dirname, "assets", "appicon.iconset"),
        appCopyright: "Copyright (C) 2020–2022 Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
        "Klaus Reimer and Jennifer van Veen",
        appVersion: appVersion
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
      new WebPackPlugin({
        mainConfig: "./webpack.main.config.js",
        jsonStats: false,
        packageSourceMaps: true,
        renderer: {
          nodeIntegration: false,
          jsonStats: false,
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              //html: "index.html",
              js: "./lib/FriendlyFire.js",
              name: "./",
              preload: {
                  js: "./lib/electron-preload.js"
              }
            }
          ]
        }
      }),
      new AutoUnpackNativesPlugin({}),
    ],
    publishers: []
};
module.exports = config;
