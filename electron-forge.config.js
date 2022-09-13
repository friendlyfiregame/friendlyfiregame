// @ts-check
const os = require("node:os");
const path = require("node:path");

// Package name for macOS should be different.
const packageName = os.platform() === "darwin" ? "Friendly Fire" : "friendlyfire";
const productName = "Friendly Fire";

/** @type {import("electron-packager").Win32MetadataOptions} */
const win32Metadata = {
    FileDescription: "A small 2d platform adventure game with handcrafted pixel art, an original soundtrack and lots of love put into the creation of the characters and dialogs.",
    ProductName: "Friendly Fire",
};

const appVersion = require(path.resolve(__dirname, "package.json")).version;
const appHomepage = require(path.resolve(__dirname, "package.json")).homepage;

// cSpell:disable

/** @type {import("@electron-forge/maker-deb").MakerDebConfig} */
const makerDebConfig = {
    options: {
        icon: "./assets/appicon.iconset/icon_256x256.png",
        productName: productName,
        genericName: productName,
        categories: [
            "Game"
        ],
        homepage: appHomepage,
        version: appVersion
    }
};

/** @type {import("@electron-forge/maker-rpm").MakerRpmConfig} */
const makerRpmConfig = {
    options: {
        icon: "./assets/appicon.iconset/icon_256x256.png",
        productName: productName,
        genericName: productName,
        categories: [
            "Game"
        ],
        homepage: appHomepage,
        version: appVersion
    }
};

/** @type {import("@electron-forge/maker-squirrel").MakerSquirrelConfig} */
const makerSquirrelConfig = {
    name: "friendlyfire",
    version: appVersion
};

const config = {
    packagerConfig: {
        asar: { // cspell:disable-line
            unpack: [
                "*.node",
                "*.so",
                "*.dll",
                "*.dylib"
            ]
        },
        name: packageName,
        // https://electron.github.io/electron-packager/master/interfaces/electronpackager.win32metadataoptions.html
        win32metadata: win32Metadata,
        icon: path.resolve(__dirname, "assets", "appicon.iconset"),
        appCopyright: "Copyright (C) 2020–2022 Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
        "Klaus Reimer and Jennifer van Veen",
        appVersion: appVersion
    },
    /** @type {import("@electron-forge/shared-types").IForgeResolvableMaker[]} */
    makers: [
      {
        name: "@electron-forge/maker-squirrel",
        config: makerSquirrelConfig,
        enabled: true,
        platforms: [
            "linux",
            "win32",
            "darwin"
        ]
      },
      {
        name: "@electron-forge/maker-zip",
        config: /** @type {import("@electron-forge/maker-zip").MakerZIPConfig} */ ({}),
        enabled: true,
        platforms: [
          "darwin"
        ]
      },
      {
        name: "@electron-forge/maker-deb",
        config: makerDebConfig,
        enabled: true,
        platforms: [
          "linux"
        ]
      },
      {
        name: "@electron-forge/maker-rpm",
        enabled: true,
        config: makerRpmConfig,
        platforms: [
          "linux"
        ]
      }
    ],
    plugins: [
      [
        "@electron-forge/plugin-webpack",
        /** @type {import("@electron-forge/plugin-webpack").WebpackPluginConfig} */
        ({
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
      ],
      [
        "@electron-forge/plugin-auto-unpack-natives",
        /** @type {import("@electron-forge/plugin-auto-unpack-natives").AutoUnpackNativesConfig} */
        ({})
      ]
    ],
    publishers: []
};
module.exports = config;
