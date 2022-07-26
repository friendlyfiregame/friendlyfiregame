const os = require("node:os");
const path = require("node:path");

// Package name for macOS should be different.
const packageName = os.platform() === "darwin" ? "Friendly Fire" : "friendlyfire";

const config = {
    packagerConfig: {
        asar: { // cspell:disable-line
            unpack: ["*.so", "*.dll", "*.dylib"]
        },
        name: packageName,
        // https://electron.github.io/electron-packager/master/interfaces/electronpackager.win32metadataoptions.html
        win32metadata: {
            FileDescription: "A small 2d platform adventure game with handcrafted pixel art, an original soundtrack and lots of love put into the creation of the characters and dialogs.",
            ProductName: "Friendly Fire"
        },
        icon: path.resolve(__dirname, "assets", "appicon.iconset"),
        appCopyright: "Copyright (C) 2020–2022 Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
        "Klaus Reimer and Jennifer van Veen",
        appVersion: require(path.resolve(__dirname, "package.json")).version
    },
    makers: [
      {
        name: "@electron-forge/maker-squirrel",
        config: {
          name: "friendlyfire"
        },
        enabled: true,
        platforms: [
            "linux",
            "win32",
            "darwin"
        ]
      },
      {
        name: "@electron-forge/maker-zip",
        config: {},
        enabled: true,
        platforms: [
          "darwin"
        ]
      },
      {
        name: "@electron-forge/maker-deb",
        config: {
          icon: "./assets/appicon.iconset/icon_256x256.png",
          productName: "Friendly Fire",
          genericName: "Friendly Fire",
          categories: [
            "Game"
          ]
        },
        enabled: true,
        platforms: [
          "linux"
        ]
      },
      {
        name: "@electron-forge/maker-rpm",
        enabled: true,
        config: {},
        platforms: [
          "linux"
        ]
      }
    ],
    plugins: [
      [
        "@electron-forge/plugin-webpack",
        {
          mainConfig: "./webpack.main.config.js",
          renderer: {
            config: "./webpack.renderer.config.js",
            entryPoints: [
              {
                js: "./lib/FriendlyFire.js",
                name: "./"
              }
            ]
          }
        },
      ],
      [
        "@electron-forge/plugin-auto-unpack-natives",
        {}
      ]
    ],
    publishers: [],
    electronRebuildConfig: {}
};
module.exports = config;
