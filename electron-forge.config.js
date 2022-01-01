const os = require("os");
const path = require("path");

// Package name for macOS should be different.
const packageName = os.platform() === "darwin" ? "Friendly Fire" : "friendlyfire";

module.exports = {
    packagerConfig: {
        name: packageName,
        // https://electron.github.io/electron-packager/master/interfaces/electronpackager.win32metadataoptions.html
        win32metadata: {
            FileDescription: "A small 2d platform adventure game with handcrafted pixel art, an original soundtrack and lots of love put into the creation of the characters and dialogs.",
            ProductName: "Friendly Fire"
        },
        icon: path.resolve(__dirname, "assets", "appicon.iconset"),
        appCopyright: "Copyright (C) 2020 Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
        "Klaus Reimer and Jennifer van Veen",
        appVersion: require(path.resolve(__dirname, "package.json")).version
    },
    makers: [
      {
        name: "@electron-forge/maker-squirrel",
        config: {
          name: "friendlyfire"
        }
      },
      {
        name: "@electron-forge/maker-zip",
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
        }
      },
      {
        name: "@electron-forge/maker-rpm",
        config: {}
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
        }
      ]
    ]
  };
