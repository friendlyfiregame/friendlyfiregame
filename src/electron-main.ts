// cSpell:disable

import * as electron from "electron";
import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH, STEAM_APP_ID } from "./constants";
import * as path from "node:path";
import * as process from "node:process";

async function createWindow(app: Electron.App): Promise<void> {

    let fullscreen = true;
    if (app.commandLine.hasSwitch("no-fullscreen")) {
        fullscreen = false;
    } else if (app.commandLine.hasSwitch("fullscreen")) {
        fullscreen = ["", "true"].includes(app.commandLine.getSwitchValue("fullscreen").toLowerCase());
    }

    if (app.commandLine.hasSwitch("steam-app")) {

        // Necessary for Steam Overlays to work.
        // See: https://github.com/ceifa/steamworks.js#electron-instructions
        app.commandLine.appendSwitch("in-process-gpu");
        app.commandLine.appendSwitch("disable-direct-composition");

        try {
            const steamworks = await import("steamworks.js");
            const steamAppId = Number(app.commandLine.getSwitchValue("steam-app")) || STEAM_APP_ID;
            const steamClient = steamworks.init(steamAppId);

            electron.ipcMain.handle("steamworks", async (event, args) => {
                const fn = `${args[0]}#${args[1]}`;
                switch (fn) {
                    case "#available":
                        return true;
                    case "localplayer#getName":
                        return steamClient.localplayer.getName();
                    case "localplayer#getSteamId":
                        return steamClient.localplayer.getSteamId();
                    case "achievement#isActivated":
                        return steamClient.achievement.isActivated(args[2]);
                    case "achievement#activate":
                        return steamClient.achievement.activate(args[2]);
                    case "cloud#isEnabledForApp":
                        return steamClient.cloud.isEnabledForApp();
                    case "cloud#isEnabledForAccount":
                        return steamClient.cloud.isEnabledForAccount();
                    case "cloud#readFile":
                        return steamClient.cloud.readFile(args[2]);
                    case "cloud#writeFile":
                        return steamClient.cloud.writeFile(args[2], args[3]);
                    case "cloud#deleteFile":
                        return steamClient.cloud.deleteFile(args[2]);
                    default:
                        throw new Error(`Unknown function call: ${fn} received.`);
                }
            });

        } catch (e) {
            process.stderr.write(`Initialization of Steamworks API failed.${path.sep}${path.sep}${e}${path.sep}`);
            app.exit(19);
        }

    } else {
        electron.ipcMain.handle("steamworks", async (event, args) => {
            const fn = `${args[0]}#${args[1]}`;
            if (fn === "#available") {
                return false;
            } else {
                throw new Error("Steamworks API is not available.");
            }
        });
    }

    // Create the browser window.
    const mainWindow = new electron.BrowserWindow({
        backgroundColor: "#202020",
        width: GAME_CANVAS_WIDTH,
        height: GAME_CANVAS_HEIGHT,
        useContentSize: true,
        resizable: true,
        center: true,
        maximizable: true,
        // Undefined means, switching to fullscreen is possible.
        fullscreen: fullscreen || undefined,
        title: "Friendly Fire",
        icon: path.join(__dirname, "..", "renderer", "assets", "appicon.iconset", "icon_256x256.png"),
        webPreferences: {
            contextIsolation: true,
            enableWebSQL: false,
            disableDialogs: true,
            spellcheck: false,
            preload: path.join(__dirname, "..", "renderer", "preload.js")
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

    // Open the DevTools.
    if (app.commandLine.hasSwitch("dev")) {
        const devMode: boolean = ["", "true"].includes(app.commandLine.getSwitchValue("dev").toLowerCase());
        if (devMode) {
            mainWindow.webContents.openDevTools();
        }
    }


    // Hide menu
    mainWindow.setMenu(null);
}

((app: electron.App): void => {

    // If the user wants to be informed about the version only, we'll print the version
    // and exit immediately.
    if (app.commandLine.hasSwitch("version")) {
        process.stdout.write(`Friendly Fire v${app.getVersion()}\n`);
        app.exit(0);
    }

    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
        return app.quit();
    }

    // Only one instance should ever be launched
    if (!app.requestSingleInstanceLock) {
        return app.quit();
    }

    app.name = "Friendly Fire";

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", () => createWindow(app));

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        // For this game though, the situation is a bit different and
        // we *do want* to quit the app once the last window is gone.
        app.quit();
    });

    app.on("activate", () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron.BrowserWindow.getAllWindows().length === 0) {
            createWindow(app);
        }
    });
})(electron.app);
