const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: false,
    resolve: {
        symlinks: false,
        mainFields: ["browser", "main", "module"]
    },
    node: {
        fs: "empty"
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/demo/**/*.{html,css}" },
            { from: "assets/", to: "assets/" },
            { from: "index.html", transform(content) {
                return content.toString().replace("src=\"node_modules/steal/steal.js\" main=\"lib/FriendlyFire\"",
                    "src=\"index.js\"");
            }},
            { from: "style.css" }
        ])
    ]
}
