// cSpell:disable

import * as electron from "electron";
import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH, STEAM_APP_ID } from "./constants";
import * as path from "node:path";
import * as os from "node:os";

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

        exportLdLibraryPath(app);

        try {
            const steamworks = await import("steamworks.js");
            const steamAppId = Number(app.commandLine.getSwitchValue("steam-app"));
            steamworks.init(steamAppId || STEAM_APP_ID);
        } catch (e) {
            process.stderr.write("Initialization of Steamworks API failed.\n");
            process.stderr.write(`\n${e}\n`);
            app.exit(19);
        }

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
            spellcheck: false
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

/**
 * Resolves the path where shared dynamic libraries should be picked up from.
 * @param app
 *   Electron app object.
 * @param platform
 *   Platform for the native modules directory to be resolved. Defaults to the platform
 *   of the currently running process.
 * @param arch
 *   Processor architecture for the native modules directory to be resolved. Defaults to the
 *   processor architecture of the currently running process.
 * @returns
 *   Absolute path that should contain the shared native libraries that come bundled with the
 *   Electron app.
 */
function resolveNativeModulesDir(app: electron.App, platform?: string, arch?: string): string {
    const nativeModulesDir = path.resolve(path.dirname(app.getAppPath()), "app.asar.unpacked", ".webpack", "main", "native_modules", "dist");
    platform = platform ? platform : os.platform();
    arch = arch ? arch: os.arch();
    if (platform === "linux" && arch === "x64") {
        return path.resolve(nativeModulesDir, "linux64");
    }
    return path.resolve(nativeModulesDir, `${platform}-${arch}`);
}

function exportLdLibraryPath(app: electron.App, nativeModulesDir?: string, platform?: string): void {
    nativeModulesDir = nativeModulesDir ? nativeModulesDir : resolveNativeModulesDir(app);
    platform = platform ? platform : os.platform();
    let paths: string[] = [];
    if (platform === "linux") {
        if (process.env.LD_LIBRARY_PATH != null) {
            paths = process.env.LD_LIBRARY_PATH.split(path.delimiter);
        }
        if (!paths.includes(nativeModulesDir)) {
            paths.push(nativeModulesDir);
        }
        process.env.LD_LIBRARY_PATH = paths.join(path.delimiter);
    }
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
