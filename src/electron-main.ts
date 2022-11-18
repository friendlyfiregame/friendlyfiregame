// cSpell:disable

import * as electron from "electron";
import { default as ConfigStore} from "electron-store";

import { APP_NAME, GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH, STEAM_APP_ID } from "./constants";
import * as os from "node:os";
import * as path from "node:path";
import * as process from "node:process";

type PreferencesConfigStore = ConfigStore<{
    fullscreen: boolean
}>;

async function createWindow(app: Electron.App, preferences: PreferencesConfigStore, fullscreen: boolean): Promise<void> {

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
        fullscreenable: true,
        title: APP_NAME,
        icon: path.join(__dirname, "..", "renderer", "assets", "appicon.iconset", "icon_256x256.png"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            enableWebSQL: false,
            disableDialogs: true,
            spellcheck: false,
            preload: path.join(__dirname, "..", "renderer", "preload.js")
        }
    });
    mainWindow.setAspectRatio(GAME_CANVAS_WIDTH / GAME_CANVAS_HEIGHT);

    preferences.onDidChange("fullscreen", (newFullscreen) => {
        if (typeof newFullscreen === "boolean" && mainWindow.isFullScreenable()) {
            mainWindow.setFullScreen(newFullscreen);
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

(async (app: electron.App): Promise<void> => {

    const preferences: PreferencesConfigStore = new ConfigStore();

    // If the user wants to be informed about the version only, we'll print the version
    // and exit immediately.
    if (app.commandLine.hasSwitch("version")) {
        process.stdout.write(`${APP_NAME} v${app.getVersion()}\n`);
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

    app.name = APP_NAME;
    app.enableSandbox();

    //#region Necessary for Steam Overlays to work.
    // See: https://github.com/ceifa/steamworks.js#electron-instructions
    app.commandLine.appendSwitch("in-process-gpu");
    app.commandLine.appendSwitch("disable-direct-composition");
    //#endregion

    //#region Steamworks API integration
    if (app.commandLine.hasSwitch("steam-app")) {

        try {
            const steamworks = await import("steamworks.js");
            const steamAppId = Number(app.commandLine.getSwitchValue("steam-app")) || STEAM_APP_ID;
            const steamClient = steamworks.init(steamAppId);
            steamworks.electronEnableSteamOverlay();

            electron.ipcMain.handle("steamworks", async (_event, args) => {
                const fn = `${args[0]}#${args[1]}`;
                switch (fn) {
                    case "#initialized":
                        return steamClient != null;
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
            process.stderr.write(`Initialization of Steamworks API failed.${os.EOL}${os.EOL}${e}${os.EOL}`);
            app.exit(19);
        }

    } else {
        electron.ipcMain.handle("steamworks", async (_event, args) => {
            const fn = `${args[0]}#${args[1]}`;
            if (fn === "#available") {
                return false;
            } else {
                throw new Error("Steamworks API is not available.");
            }
        });
    }
    //#endregion

    //#region Fullscreen preferences API
    electron.ipcMain.handle("preferences", async (_event, args) => {
        const fn = `${args[0]}#${args[1]}`;
        switch (fn) {
        case "fullscreen#isEnabled":
            return preferences.get("fullscreen", true);
        case "fullscreen#setEnabled":
            return preferences.set("fullscreen", args[2]);
        default:
            throw new Error(`Unable to handle preferences function: ${fn}`);
        }
    });
    let fullscreen = preferences.get("fullscreen", true);
    if (app.commandLine.hasSwitch("no-fullscreen")) {
        fullscreen = !(["", "true"].includes(app.commandLine.getSwitchValue("no-fullscreen").toLowerCase()));
    } else if (app.commandLine.hasSwitch("fullscreen")) {
        fullscreen = ["", "true"].includes(app.commandLine.getSwitchValue("fullscreen").toLowerCase());
    }
    preferences.set("fullscreen", fullscreen);
    //#endregion


    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", async () => createWindow(app, preferences, fullscreen));

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        // For this game though, the situation is a bit different and
        // we *do want* to quit the app once the last window is gone.
        app.quit();
    });

    app.on("activate", async () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron.BrowserWindow.getAllWindows().length === 0) {
            return createWindow(app, preferences, fullscreen);
        }
    });
})(electron.app);
