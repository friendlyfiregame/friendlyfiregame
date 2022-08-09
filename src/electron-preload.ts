import { contextBridge, ipcRenderer } from "electron";
import { SteamworksApi } from "./steamworks/SteamworksApi";
import { Preferences } from "./preferences/Preferences";

// cSpell:disable
const steamworks: SteamworksApi = {
    available: true,
    initialized: async () => ipcRenderer.invoke("steamworks", ["", "initialized"]),
    localplayer: {
        getName: async () => ipcRenderer.invoke("steamworks", ["localplayer", "getName"]),
        getSteamId: async () => ipcRenderer.invoke("steamworks", ["localplayer", "getSteamId"])
    },
    achievement: {
        isActivated: async (achievementId: string) => ipcRenderer.invoke("steamworks", ["achievement", "isActivated", achievementId]),
        activate: async (achievementId: string) => ipcRenderer.invoke("steamworks", ["achievement", "activate", achievementId])
    },
    cloud: {
        isEnabledForApp: async () => ipcRenderer.invoke("steamworks", ["cloud", "isEnabledForApp"]),
        isEnabledForAccount: async () => ipcRenderer.invoke("steamworks", ["cloud", "isEnabledForAccount"]),
        readFile: async (name: string) => ipcRenderer.invoke("steamworks", ["cloud", "readFile", name]),
        writeFile: async (name: string, content: string) => ipcRenderer.invoke("steamworks", ["cloud", "writeFile", name, content]),
        deleteFile: async (name) => ipcRenderer.invoke("steamworks", ["cloud", "deleteFile", name])
    }
};

const preferences: Preferences = {
    fullscreen: {
        isEnabled: async () => ipcRenderer.invoke("preferences", ["fullscreen", "isEnabled"]),
        setEnabled: async (fullscreen: boolean) => ipcRenderer.invoke("preferences", ["fullscreen", "setEnabled", fullscreen]),
    }
};

function init(): void {
    contextBridge.exposeInMainWorld("steamworks", steamworks);
    contextBridge.exposeInMainWorld("preferences", preferences);
}

process.once("loaded", init);
