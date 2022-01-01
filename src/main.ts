import { app, BrowserWindow } from "electron";
import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH } from "./constants";
import path from "path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
    app.quit();
}

app.name = "Friendly Fire";

const createWindow = () => {

    let fullscreen = true;
    if (app.commandLine.hasSwitch("no-fullscreen")) {
        fullscreen = false;
    } else if (app.commandLine.hasSwitch("fullscreen")) {
        fullscreen = ["", "true"].includes(app.commandLine.getSwitchValue("fullscreen").toLowerCase());
    }

    // Create the browser window.
    const mainWindow = new BrowserWindow({
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

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
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
