import { contextBridge, ipcRenderer } from "electron";

// cSpell:disable
const steamworks = {
    available: () => ipcRenderer.invoke("steamworks", ["", "available"]),
    localplayer: {
        getName: () => ipcRenderer.invoke("steamworks", ["localplayer", "getName"]),
        getSteamId: () => ipcRenderer.invoke("steamworks", ["localplayer", "getSteamId"])
    }
};

function init(): void {
    contextBridge.exposeInMainWorld("steamworks", steamworks);
}

process.once("loaded", init);
