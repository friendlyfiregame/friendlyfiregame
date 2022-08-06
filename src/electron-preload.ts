import { contextBridge, ipcRenderer } from "electron";

// cSpell:disable
const steamworks = {
    available: () => ipcRenderer.invoke("steamworks", ["", "available"]),
    localplayer: {
        getName: () => ipcRenderer.invoke("steamworks", ["localplayer", "getName"]),
        getSteamId: () => ipcRenderer.invoke("steamworks", ["localplayer", "getSteamId"])
    },
    achievement: {
        isActivated: (achievementId: string) => ipcRenderer.invoke("steamworks", ["achievement", "isActivated", achievementId]),
        activate: (achievementId: string) => ipcRenderer.invoke("steamworks", ["achievement", "activate", achievementId])
    },
    cloud: {
        isEnabledForApp: () => ipcRenderer.invoke("steamworks", ["cloud", "isEnabledForApp"]),
        isEnabledForAccount: () => ipcRenderer.invoke("steamworks", ["cloud", "isEnabledForAccount"]),
        readFile: (name: string) => ipcRenderer.invoke("steamworks", ["cloud", "readFile", name]),
        writeFile: (name: string, content: string) => ipcRenderer.invoke("steamworks", ["cloud", "writeFile", name, content]),
        deleteFile: (name: string) => ipcRenderer.invoke("steamworks", ["cloud", "deleteFile", name])
    }
};

function init(): void {
    contextBridge.exposeInMainWorld("steamworks", steamworks);
}

process.once("loaded", init);

// After the preload script has been executed, a new global field "steamworks" will be avaiable.
declare global {
  interface Window {
    steamworks: typeof steamworks;
  }
}
